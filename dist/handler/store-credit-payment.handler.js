"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCreditPaymentHandler = void 0;
const core_1 = require("@vendure/core");
const constants_1 = require("../constants");
const store_credit_service_1 = require("../service/store-credit.service");
let customerService;
let sellerService;
let productService;
let shippingMethodService;
let channelService;
let entityHydrator;
let options;
let storeCreditService;
let connection;
// Vendure doesn't use decimals so I scale it so it's comparing values at the same magnitude
const SCALING_FACTOR = 100;
exports.StoreCreditPaymentHandler = new core_1.PaymentMethodHandler({
    code: 'credit-store-payment',
    description: [
        {
            languageCode: core_1.LanguageCode.en,
            value: 'Pay with Credit',
        },
    ],
    args: {},
    init(injector) {
        sellerService = injector.get(core_1.SellerService);
        customerService = injector.get(core_1.CustomerService);
        productService = injector.get(core_1.ProductService);
        shippingMethodService = injector.get(core_1.ShippingMethodService);
        channelService = injector.get(core_1.ChannelService);
        entityHydrator = injector.get(core_1.EntityHydrator);
        storeCreditService = injector.get(store_credit_service_1.StoreCreditService);
        connection = injector.get(core_1.TransactionalConnection);
        options = injector.get(constants_1.STORE_CREDIT_PLUGIN_OPTIONS);
    },
    async createPayment(ctx, order, amount, args, metadata) {
        var _a;
        const customer = order.customer;
        if (!customer) {
            return {
                amount: amount,
                state: 'Declined',
                metadata: {
                    public: {
                        errorMessage: 'Customer Not found',
                    },
                },
            };
        }
        const theCustomer = await customerService.findOne(ctx, customer.id, ['user']);
        if (!theCustomer || !(theCustomer === null || theCustomer === void 0 ? void 0 : theCustomer.user)) {
            return {
                amount: amount,
                state: 'Declined',
                metadata: {
                    public: {
                        errorMessage: 'Customer or its user not found',
                    },
                },
            };
        }
        const customerCreditBalance = theCustomer.user.customFields.accountBalance || 0;
        const conversion_factor = options.creditToCurrencyFactor[order.currencyCode] || options.creditToCurrencyFactor['default'];
        // Scale the currencyBalance Up to match magnitude of `amount`
        // then we multiply by the conversion factor to convert from credit to dollar value
        const customerCurrencyBalance = customerCreditBalance * SCALING_FACTOR * conversion_factor;
        // This `amount` doesn't have decimals
        if (customerCurrencyBalance < amount) {
            throw new Error('Insufficient Balance');
        }
        //     return {
        //         amount: amount,
        //         state: 'Declined',
        //         errorMessage: 'Insufficient Balance',
        //         metadata: {
        //             public: {
        //                 errorMessage: 'Insufficient Balance',
        //             },
        //         },
        //     };
        // }
        const orderShippingLines = order.shippingLines;
        const defaultChannel = await channelService.getDefaultChannel();
        for (let orderline of order.lines) {
            await entityHydrator.hydrate(ctx, orderline.productVariant, {
                relations: ['channels', 'channels.seller'],
            });
            const productPriceWithTax = orderline.proratedUnitPriceWithTax * orderline.quantity;
            if (!orderline.productVariant.channels || !orderline.productVariant.channels)
                continue;
            const sellerChannel = orderline.productVariant.channels.find(channel => channel.id !== defaultChannel.id);
            const sellerId = sellerChannel === null || sellerChannel === void 0 ? void 0 : sellerChannel.sellerId;
            if (!sellerId) {
                return {
                    amount: amount,
                    state: 'Declined',
                    errorMessage: 'One of Seller Not Found',
                    metadata: {
                        public: {
                            errorMessage: 'One of Seller Not Found',
                        },
                    },
                };
            }
            let shippingLine = null;
            let totalShippingCharge = 0;
            for (const shoppingLine of orderShippingLines) {
                if (!shoppingLine.shippingMethodId)
                    continue;
                const shippingMethod = await shippingMethodService.findOne(ctx, shoppingLine.shippingMethodId, false, ['channels']);
                const channels = shippingMethod === null || shippingMethod === void 0 ? void 0 : shippingMethod.channels;
                const channel = channels === null || channels === void 0 ? void 0 : channels.find(channel => channel.id === sellerChannel.id);
                if (channel !== undefined) {
                    shippingLine = shoppingLine;
                    break;
                }
            }
            if (shippingLine) {
                totalShippingCharge = shippingLine.discountedPriceWithTax;
            }
            const totalPrice = productPriceWithTax + totalShippingCharge;
            const seller = sellerChannel.seller;
            if (!seller) {
                core_1.Logger.error('Seller Not Found');
                return {
                    amount: amount,
                    state: 'Declined',
                    errorMessage: 'Seller Not Found',
                    metadata: {
                        public: {
                            errorMessage: 'Seller Not Found',
                        },
                    },
                };
            }
            // The total price doesn't include decimals so is divided by the scaling_factor
            // and needs to be scaled to deliver the correct number of credits based on the priced
            const adjustedTotalPrice = totalPrice / (SCALING_FACTOR * conversion_factor);
            const theSellerUser = await storeCreditService.getSellerUser(ctx, sellerId);
            const sellerAccountBalance = ((_a = theSellerUser.customFields) === null || _a === void 0 ? void 0 : _a.accountBalance) || 0;
            let platFormFee = options.platformFee.type == 'fixed'
                ? options.platformFee.value
                : options.platformFee.value * (orderline.listPrice / SCALING_FACTOR);
            const newBalance = sellerAccountBalance - platFormFee + adjustedTotalPrice;
            await connection.getRepository(ctx, core_1.User).update(theSellerUser.id, {
                customFields: {
                    accountBalance: newBalance,
                },
            });
        }
        console.log('customerCreditBalance: ', customerCreditBalance);
        console.log('amount: ', amount);
        console.log('rounded amount: ', amount / conversion_factor);
        console.log('conversion factor: ', conversion_factor);
        const adjustedAmount = amount / (SCALING_FACTOR * conversion_factor);
        console.log('newBalance: ', customerCreditBalance - adjustedAmount);
        // await customerService.update(ctx, {
        //     id: customer.id,
        //     customFields: {
        //         accountBalance: customerCreditBalance - Math.ceil(adjustedAmount),
        //     },
        // });
        await connection.getRepository(ctx, core_1.User).update(customer.id, {
            customFields: {
                accountBalance: customerCreditBalance - adjustedAmount,
            },
        });
        return {
            amount: amount,
            state: 'Settled',
            metadata: {
                public: {
                    message: 'Success',
                },
            },
        };
    },
    async settlePayment() {
        return {
            success: true,
        };
    },
});
