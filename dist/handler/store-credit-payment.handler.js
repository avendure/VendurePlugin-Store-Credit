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
exports.StoreCreditPaymentHandler = new core_1.PaymentMethodHandler({
    code: "credit-store-payment",
    description: [
        {
            languageCode: core_1.LanguageCode.en,
            value: "Pay with Credit",
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
        const customer = order.customer;
        if (!customer) {
            return {
                amount: amount,
                state: "Declined",
                metadata: {
                    public: {
                        errorMessage: "Customer Not found",
                    },
                },
            };
        }
        const customerCreditBalance = customer.customFields.accountBalance || 0;
        const conversion_factor = options.creditToCurrencyFactor[order.currencyCode] ||
            options.creditToCurrencyFactor["default"];
        const customerCurrencyBalance = customerCreditBalance * conversion_factor;
        if (customerCurrencyBalance < amount) {
            return {
                amount: amount,
                state: "Declined",
                errorMessage: "Insufficient Balance: " +
                    customerCurrencyBalance +
                    ", " +
                    conversion_factor,
                metadata: {
                    public: {
                        errorMessage: "Insufficient Balance: " +
                            customerCurrencyBalance +
                            ", " +
                            conversion_factor,
                    },
                },
            };
        }
        const orderShippingLines = order.shippingLines;
        const defaultChannel = await channelService.getDefaultChannel();
        for (let orderline of order.lines) {
            await entityHydrator.hydrate(ctx, orderline.productVariant, {
                relations: ["channels", "channels.seller"],
            });
            const productPriceWithTax = orderline.proratedUnitPriceWithTax * orderline.quantity;
            if (!orderline.productVariant.channels ||
                !orderline.productVariant.channels)
                continue;
            const sellerChannel = orderline.productVariant.channels.find((channel) => channel.id !== defaultChannel.id);
            const sellerId = sellerChannel === null || sellerChannel === void 0 ? void 0 : sellerChannel.sellerId;
            if (!sellerId) {
                return {
                    amount: amount,
                    state: "Declined",
                    errorMessage: "One of Seller Not Found",
                    metadata: {
                        public: {
                            errorMessage: "One of Seller Not Found",
                        },
                    },
                };
            }
            let shippingLine = null;
            let totalShippingCharge = 0;
            for (const shoppingLine of orderShippingLines) {
                if (!shoppingLine.shippingMethodId)
                    continue;
                const shippingMethod = await shippingMethodService.findOne(ctx, shoppingLine.shippingMethodId, false, ["channels"]);
                const channels = shippingMethod === null || shippingMethod === void 0 ? void 0 : shippingMethod.channels;
                const channel = channels === null || channels === void 0 ? void 0 : channels.find((channel) => channel.id === sellerChannel.id);
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
                core_1.Logger.error("Seller Not Found");
                return {
                    amount: amount,
                    state: "Declined",
                    errorMessage: "Seller Not Found",
                    metadata: {
                        public: {
                            errorMessage: "Seller Not Found",
                        },
                    },
                };
            }
            const sellerCustomFields = seller.customFields;
            const sellerAccountBalance = (sellerCustomFields === null || sellerCustomFields === void 0 ? void 0 : sellerCustomFields.accountBalance) || 0;
            let platFormFee = options.platformFee.type == "fixed"
                ? options.platformFee.value
                : options.platformFee.value * orderline.listPrice;
            const newBalance = sellerAccountBalance -
                Math.round(platFormFee) +
                Math.round(totalPrice / 100);
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
                accountBalance: customerCreditBalance - Math.round(amount / conversion_factor),
            },
        });
        return {
            amount: amount,
            state: "Settled",
            metadata: {
                public: {
                    message: "Success",
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
