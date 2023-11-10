"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCreditPaymentHandler = void 0;
const core_1 = require("@vendure/core");
let customerService;
let sellerService;
let productService;
let shippingMethodService;
let channelService;
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
    },
    async createPayment(ctx, order, amount, args, metadata) {
        const customer = order.customer;
        console.log(amount);
        console.log('customer: ' + JSON.stringify(customer, null, 2));
        console.log('here');
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
        const customerCustomFields = customer.customFields;
        const customerAccountBalance = (customerCustomFields === null || customerCustomFields === void 0 ? void 0 : customerCustomFields.accountBalance) || 0;
        const totalAmtToBePaidToSeller = amount;
        const realCustomerAccountBalance = customerAccountBalance * 100;
        console.log('Customer account balance: ', realCustomerAccountBalance, ' - totalAmtToBePaidToSeller: ', totalAmtToBePaidToSeller);
        if (realCustomerAccountBalance < totalAmtToBePaidToSeller) {
            console.log('Hit error...');
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
        for (let orderLine of order.lines) {
            const productVariant = orderLine.productVariant;
            const productId = productVariant.productId;
            const product = await productService.findOne(ctx, productId, [
                'channels',
                'channels.seller',
            ]);
            const productPriceWithTax = orderLine.proratedUnitPriceWithTax * orderLine.quantity;
            if (!product || !product.channels)
                continue;
            const sellerChannel = product.channels.find((channel) => channel.id !== defaultChannel.id);
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
                const shippingMethod = await shippingMethodService.findOne(ctx, shoppingLine.shippingMethodId, false, ['channels', 'channels.seller']);
                const channels = shippingMethod === null || shippingMethod === void 0 ? void 0 : shippingMethod.channels;
                const channel = channels === null || channels === void 0 ? void 0 : channels.find((channel) => channel.sellerId === sellerId);
                if (channel !== undefined) {
                    shippingLine = shoppingLine;
                    break;
                }
            }
            if (shippingLine) {
                totalShippingCharge = shippingLine.discountedPriceWithTax;
            }
            const totalPrice = productPriceWithTax + totalShippingCharge;
            const seller = await sellerService.findOne(ctx, sellerId);
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
            const sellerCustomFields = seller.customFields;
            const sellerAccountBalance = (sellerCustomFields === null || sellerCustomFields === void 0 ? void 0 : sellerCustomFields.accountBalance) || 0;
            let platFormFee = Math.round(orderLine.listPrice / 1000);
            const newBalance = sellerAccountBalance - platFormFee + Math.round(totalPrice / 100);
            await sellerService.update(ctx, {
                id: seller.id,
                customFields: {
                    accountBalance: newBalance,
                },
            });
        }
        await customerService.update(ctx, {
            id: customer.id,
            customFields: {
                accountBalance: customerAccountBalance - Math.round(totalAmtToBePaidToSeller / 100),
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
