"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCreditPaymentHandler = void 0;
const core_1 = require("@vendure/core");
const constants_1 = require("../constants");
let customerService;
let sellerService;
let productService;
let shippingMethodService;
let channelService;
let entityHydrator;
let options;
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
        const customerCreditBalance = customer.customFields.accountBalance || 0;
        const conversion_factor = options.creditToCurrencyFactor[order.currencyCode] || options.creditToCurrencyFactor['default'];
        // Scale the currencyBalance Up to match magnitude of `amount`
        // then we multiply by the conversion factor to convert from credit to dollar value
        const customerCurrencyBalance = customerCreditBalance * SCALING_FACTOR * conversion_factor;
        // This `amount` doesn't have decimals
        if (customerCurrencyBalance < amount) {
            return {
                amount: amount,
                state: 'Declined',
                errorMessage: 'Insufficient Balance',
                metadata: {
                    public: {
                        errorMessage: 'Insufficient Balance',
                    },
                },
            };
        }
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
            // isFraction case
            let adjustedTotalPrice = totalPrice / conversion_factor;
            if (!options.isFraction) {
                adjustedTotalPrice = Math.ceil(adjustedTotalPrice / SCALING_FACTOR) * SCALING_FACTOR;
            }
            let platFormFee = options.platformFee.type == 'fixed'
                ? options.platformFee.value
                : options.platformFee.value * (orderline.listPrice / SCALING_FACTOR);
            const newBalance = ((_a = seller.customFields) === null || _a === void 0 ? void 0 : _a.accountBalance) - platFormFee + adjustedTotalPrice;
            if (newBalance < 0) {
                return {
                    amount: amount,
                    state: 'Declined',
                    errorMessage: 'Insufficient Balance',
                    metadata: {
                        public: {
                            errorMessage: 'Insufficient Balance',
                        },
                    },
                };
            }
            await sellerService.update(ctx, {
                id: seller.id,
                customFields: {
                    accountBalance: newBalance,
                },
            });
        }
        let adjustedAmount = amount / conversion_factor;
        if (!options.isFraction) {
            //put zeros in the last two digits
            const wholeNumber = Math.ceil(adjustedAmount / SCALING_FACTOR) * SCALING_FACTOR;
            adjustedAmount = wholeNumber / conversion_factor;
        }
        let newCreditBalance = customerCreditBalance - adjustedAmount;
        if (newCreditBalance < 0) {
            return {
                amount: amount,
                state: 'Declined',
                errorMessage: 'Insufficient Balance',
                metadata: {
                    public: {
                        errorMessage: 'Insufficient Balance',
                    },
                },
            };
        }
        await customerService.update(ctx, {
            id: customer.id,
            customFields: {
                accountBalance: newCreditBalance,
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
