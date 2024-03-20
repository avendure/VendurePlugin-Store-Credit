import {
    PaymentMethodHandler,
    LanguageCode,
    CustomerService,
    SellerService,
    Injector,
    ProductService,
    ShippingMethodService,
    ChannelService,
    Logger,
    EntityHydrator,
} from '@vendure/core';
import { STORE_CREDIT_PLUGIN_OPTIONS } from '../constants';
import { StoreCreditPluginOptions } from 'src/types/options';

let customerService: CustomerService;
let sellerService: SellerService;
let productService: ProductService;
let shippingMethodService: ShippingMethodService;
let channelService: ChannelService;
let entityHydrator: EntityHydrator;
let options: StoreCreditPluginOptions;

// Vendure doesn't use decimals so I scale it so it's comparing values at the same magnitude
const SCALING_FACTOR = 100;

export const StoreCreditPaymentHandler = new PaymentMethodHandler({
    code: 'credit-store-payment',
    description: [
        {
            languageCode: LanguageCode.en,
            value: 'Pay with Credit',
        },
    ],
    args: {},

    init(injector: Injector) {
        sellerService = injector.get(SellerService);
        customerService = injector.get(CustomerService);
        productService = injector.get(ProductService);
        shippingMethodService = injector.get(ShippingMethodService);
        channelService = injector.get(ChannelService);
        entityHydrator = injector.get(EntityHydrator);
        options = injector.get(STORE_CREDIT_PLUGIN_OPTIONS);
    },

    async createPayment(ctx, order, amount, args, metadata) {
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
        const conversion_factor =
            options.creditToCurrencyFactor[order.currencyCode] || options.creditToCurrencyFactor['default'];

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

            if (!orderline.productVariant.channels || !orderline.productVariant.channels) continue;

            const sellerChannel = orderline.productVariant.channels.find(
                channel => channel.id !== defaultChannel.id,
            );

            const sellerId = sellerChannel?.sellerId;

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
                if (!shoppingLine.shippingMethodId) continue;
                const shippingMethod = await shippingMethodService.findOne(
                    ctx,
                    shoppingLine.shippingMethodId,
                    false,
                    ['channels'],
                );
                const channels = shippingMethod?.channels;
                const channel = channels?.find(channel => channel.id === sellerChannel.id);
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
                Logger.error('Seller Not Found');
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
            let platFormFee =
                options.platformFee.type == 'fixed'
                    ? options.platformFee.value
                    : options.platformFee.value * (orderline.listPrice / SCALING_FACTOR);

            const newBalance = seller.customFields?.accountBalance - platFormFee + adjustedTotalPrice;

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
