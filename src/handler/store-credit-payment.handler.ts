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
} from '@vendure/core';

let customerService: CustomerService;
let sellerService: SellerService;
let productService: ProductService;
let shippingMethodService: ShippingMethodService;
let channelService: ChannelService;

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
    const customerAccountBalance = customerCustomFields?.accountBalance || 0;

    const totalAmtToBePaidToSeller = amount;
    const realCustomerAccountBalance = customerAccountBalance * 100;

    console.log(
      'Customer account balance: ',
      realCustomerAccountBalance,
      ' - totalAmtToBePaidToSeller: ',
      totalAmtToBePaidToSeller,
    );

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

      const productPriceWithTax =
        orderLine.proratedUnitPriceWithTax * orderLine.quantity;

      if (!product || !product.channels) continue;

      const sellerChannel = product.channels.find(
        (channel) => channel.id !== defaultChannel.id,
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
          ['channels', 'channels.seller'],
        );
        const channels = shippingMethod?.channels;
        const channel = channels?.find(
          (channel) => channel.sellerId === sellerId,
        );
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

      const sellerCustomFields = seller.customFields;
      const sellerAccountBalance = sellerCustomFields?.accountBalance || 0;
      let platFormFee = Math.round(orderLine.listPrice / 1000);
      const newBalance =
        sellerAccountBalance - platFormFee + Math.round(totalPrice / 100);

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
        accountBalance:
          customerAccountBalance - Math.round(totalAmtToBePaidToSeller / 100),
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
