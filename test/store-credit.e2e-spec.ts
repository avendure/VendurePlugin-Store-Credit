import {
    SqljsInitializer,
    registerInitializer,
    createTestEnvironment,
    testConfig,
    TestServer,
    SimpleGraphQLClient,
} from '@vendure/testing';
import { it, describe, afterAll, expect, beforeAll, vi, beforeEach, afterEach } from 'vitest';
import { StoreCreditPlugin } from '../src/index';
import { DefaultSearchPlugin, mergeConfig } from '@vendure/core';
import { DataService } from '@vendure/admin-ui/core';
import path from 'path';
import { initialData } from './fixtures/initial-data';
import {
    GetCustomerListDocument,
    GetCustomerListQuery,
    CreateStoreCreditDocument,
    CreateSellerDocument,
    TransferFromSellerToCustomerDocument,
    CreateChannelDocument,
    LanguageCode,
    CurrencyCode,
    AssignProductVariantsToChannelDocument,
    GetSellerDocument,
    UpdateSellerDocument,
    RequestCreditExchangeDocument,
    RefundCreditExchangeDocument,
    GetChannelsDocument,
    AcceptCreditExchangeDocument,
    GetProductsDocument,
    CreateProductVariantDocument,
    GlobalFlag,
    UpdateCreditExchangeStatusDocument,
    JobState,
    AssignShippingMethodToChannelDocument,
} from './graphql/generated-admin-types';
import {
    AddProductToOrderDocument,
    ClaimCreditDocument,
    SetShippingAddressDocument,
    SetBillingAddressDocument,
    SetShippingMethodDocument,
    TransitionToStateDocument,
    AddPaymentToOrderDocument,
    GetBalanceDocument,
    SearchDocument,
} from './graphql/generated-shop-types';

registerInitializer('sqljs', new SqljsInitializer('__data__'));

describe.each([{ isFraction: false }, { isFraction: true }])('store-credits plugin', ({ isFraction }) => {
    const feeValue = {
        type: 'fixed' as 'fixed' | 'percent',
        value: 100,
    };
    let customerClaimedBalance = 165000;

    let started = false;
    let customers: GetCustomerListQuery['customers']['items'] = [];
    let sellerId: string = '';
    let channelId: string = '';
    let creditKey: string = '';
    let defaultChannelToken: string = '';
    let server: TestServer;
    let adminClient: SimpleGraphQLClient;
    let shopClient: SimpleGraphQLClient;

    beforeAll(async () => {
        const devConfig = mergeConfig(testConfig, {
            dbConnectionOptions: {
                synchronize: true,
            },
            plugins: [
                DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: false }),
                StoreCreditPlugin.init({
                    creditToCurrencyFactor: { default: 1 },
                    npp: { name: 'Store Credits', slug: 'store-credits' },
                    exchange: {
                        fee: { type: feeValue.type, value: feeValue.value },
                        payoutOption: { code: 'payout', name: 'Payout' },
                        maxAmount: 90000,
                    },
                    isFraction: isFraction,
                    platformFee: { type: feeValue.type, value: feeValue.value },
                }),
            ],
        });

        const newTestEnv = createTestEnvironment(devConfig);
        server = newTestEnv.server;
        adminClient = newTestEnv.adminClient;
        shopClient = newTestEnv.shopClient;

        await server.init({
            productsCsvPath: path.join(__dirname, 'fixtures/products.csv'),
            initialData: initialData,
            customerCount: 3,
        });
        await adminClient.asSuperAdmin();

        defaultChannelToken = await adminClient
            .query(GetChannelsDocument)
            .then(res => res.channels.items.find(ch => ch.code == '__default_channel__')?.token || '');

        customers = await adminClient
            .query(GetCustomerListDocument, {
                options: { take: 3 },
            })
            .then(c => c.customers.items);

        started = true;
    }, 60000);

    afterAll(async () => {
        await server.destroy();
    });

    it('Should start successfully', () => {
        expect(started).toEqual(true);
        expect(customers).toHaveLength(3);
    });

    it("Should set superadmin's customer", async () => {
        const updateResult = await adminClient.query(UpdateSellerDocument, {
            input: {
                id: '1',
                customFields: {
                    customerId: customers[0].id,
                },
            },
        });
        expect(updateResult.updateSeller.customFields?.customer?.id).toEqual(customers[0].id);
    });

    it('Should create new seller', async () => {
        const createSellerResult = await adminClient.query(CreateSellerDocument, {
            input: {
                name: 'Seller 2',
                customFields: { customerId: customers[1].id },
            },
        });
        expect(createSellerResult.createSeller.id).toBeDefined();
        expect(createSellerResult.createSeller.customFields?.customer).toEqual({
            id: customers[1].id,
            emailAddress: customers[1].emailAddress,
        });
        sellerId = createSellerResult.createSeller.id;
    });

    it('Should create new channel with seller', async () => {
        const createChannelResult = await adminClient.query(CreateChannelDocument, {
            input: {
                code: 'seller2-ch',
                token: 'seller2ch',
                sellerId: sellerId,
                defaultTaxZoneId: 'T_1',
                availableLanguageCodes: [LanguageCode.en],
                pricesIncludeTax: false,
                trackInventory: true,
                defaultLanguageCode: LanguageCode.en,
                defaultShippingZoneId: 'T_1',
                defaultCurrencyCode: CurrencyCode.USD,
                availableCurrencyCodes: [CurrencyCode.USD],
            },
        });
        expect(createChannelResult.createChannel.__typename).toEqual('Channel');
        if (createChannelResult.createChannel.__typename == 'Channel') {
            expect(createChannelResult.createChannel.code).toBeDefined();
            channelId = createChannelResult.createChannel.id;
        }
    });

    it('Should assign product to channel', async () => {
        const assignResult = await adminClient.query(AssignProductVariantsToChannelDocument, {
            input: { channelId, productVariantIds: ['T_1'], priceFactor: 1 },
        });
        expect(assignResult.assignProductVariantsToChannel).toHaveLength(1);
        expect(assignResult.assignProductVariantsToChannel[0].id).toEqual('T_1');
    });

    it('Should assign Shipping method to channel', async () => {
        const assignResult = await adminClient.query(AssignShippingMethodToChannelDocument, {
            input: { channelId, shippingMethodIds: ['T_1'] },
        });
        expect(assignResult.assignShippingMethodsToChannel.length).greaterThan(0);
    });

    it('Should create store credit for purchase', async () => {
        await vi.waitFor(async () => {
            const createResult = await adminClient.query(CreateStoreCreditDocument, {
                input: {
                    name: '100 Store Credits',
                    value: 100,
                    price: 90,
                    perUserLimit: 200,
                },
            });

            expect(createResult.createStoreCredit.key).toBeTruthy();
            expect(createResult.createStoreCredit).toEqual({
                key: createResult.createStoreCredit.key,
                value: 100,
                customerId: null,
                perUserLimit: 200,
            });
        });

        //See if credits will be returned by search
        await vi.waitFor(
            async () => {
                const searchResult = await shopClient.query(SearchDocument, { input: {} });
                const hasStoreCredits = searchResult.search.items.some(item => item.slug === 'store-credits');
                expect(hasStoreCredits).toEqual(true);
            },
            {
                timeout: 2000, // default is 1000
                interval: 500, // default is 50
            },
        );
    });

    it('Should create store credit for claim by key', async () => {
        const createResult = await adminClient.query(CreateStoreCreditDocument, {
            input: {
                value: customerClaimedBalance,
                perUserLimit: 0,
            },
        });

        expect(createResult.createStoreCredit.key).toBeTruthy();
        expect(createResult.createStoreCredit).toEqual({
            key: createResult.createStoreCredit.key,
            value: customerClaimedBalance,
            customerId: null,
            perUserLimit: 0,
        });
        creditKey = createResult.createStoreCredit.key || '';
    });

    it('Should fail transfer with empty balance', async () => {
        expect(async () => {
            await adminClient.query(TransferFromSellerToCustomerDocument, {
                value: 1000,
                sellerId,
            });
        }).rejects.toThrowError('Insufficient balance');
    });

    describe('Purchase with store-credit', async () => {
        beforeAll(async () => {
            await shopClient.asUserWithCredentials(customers[2].emailAddress, 'test');
        });

        it('Should place an order', async () => {
            const addProductResult = await shopClient.query(AddProductToOrderDocument, {
                productVariantId: 'T_1',
                quantity: 1,
            });

            expect(addProductResult.addItemToOrder.__typename).toEqual('Order');
            if (addProductResult.addItemToOrder.__typename == 'Order') {
                expect(addProductResult.addItemToOrder.code).toBeDefined();
            }
        });

        it('Should set shipping/billing address, shipping method and transition order', async () => {
            const shippingAddressResult = await shopClient.query(SetShippingAddressDocument, {
                input: {
                    countryCode: 'GB',
                    streetLine1: '68 Farnborough Rd',
                    city: 'Farnborough',
                    postalCode: 'GU14 6TH',
                    province: 'Hampshire',
                },
            });
            expect(shippingAddressResult.setOrderShippingAddress.__typename).toEqual('Order');

            const billingAddressResult = await shopClient.query(SetBillingAddressDocument, {
                input: {
                    countryCode: 'GB',
                    streetLine1: '68 Farnborough Rd',
                    city: 'Farnborough',
                    postalCode: 'GU14 6TH',
                    province: 'Hampshire',
                },
            });
            expect(billingAddressResult.setOrderBillingAddress.__typename).toEqual('Order');

            const shippingMethodResult = await shopClient.query(SetShippingMethodDocument, {
                ids: ['T_1'],
            });
            expect(shippingMethodResult.setOrderShippingMethod.__typename).toEqual('Order');

            const transitionResult = await shopClient.query(TransitionToStateDocument, {
                state: 'ArrangingPayment',
            });
            expect(transitionResult.transitionOrderToState?.__typename).toEqual('Order');
        });

        it('Should fail to add payment with no credits', async () => {
            const addPaymentReuslt = await shopClient.query(AddPaymentToOrderDocument, {
                input: { method: 'store-credit', metadata: {} },
            });
            expect(addPaymentReuslt.addPaymentToOrder.__typename).toEqual('PaymentDeclinedError');
        });

        it('Should claim store credit', async () => {
            const result = await shopClient.query(ClaimCreditDocument, {
                key: creditKey,
            });

            expect(result.claim).toEqual({
                success: true,
                message: 'Successfully claimed credit',
                addedCredit: customerClaimedBalance,
                currentBalance: customerClaimedBalance,
            });
        });

        it('Should add payment', async () => {
            await shopClient.asUserWithCredentials(customers[2].emailAddress, 'test');

            const addPaymentReuslt = await shopClient.query(AddPaymentToOrderDocument, {
                input: { method: 'store-credit', metadata: {} },
            });

            expect(addPaymentReuslt.addPaymentToOrder.__typename).toEqual('Order');
            if (addPaymentReuslt.addPaymentToOrder.__typename == 'Order') {
                expect(
                    addPaymentReuslt.addPaymentToOrder.state,
                    'Order state should have transitioned',
                ).toEqual('PaymentSettled');

                const customerResult = await shopClient.query(GetBalanceDocument);
                const sellerResult = await adminClient.query(GetSellerDocument, {
                    id: sellerId,
                });

                expect(
                    sellerResult.seller?.customFields?.accountBalance,
                    "Credits should have been transferred to Seller's account",
                ).toBeGreaterThan(0);

                const totalPrce = addPaymentReuslt.addPaymentToOrder.totalWithTax;
                const totalPriceCeil = Math.ceil(totalPrce / 100) * 100;
                const currFee =
                    feeValue.type == 'fixed' ? feeValue.value : (feeValue.value / 100) * totalPrce;

                if (isFraction) {
                    expect(
                        customerResult.getSellerANDCustomerStoreCredits.customerAccountBalance,
                        "Credits should have been deducted from Buyer's account",
                    ).toEqual(customerClaimedBalance - totalPrce);

                    expect(
                        sellerResult.seller?.customFields?.accountBalance,
                        "Credits should have been transferred to Seller's account",
                    ).toEqual(totalPrce - currFee);
                } else {
                    expect(
                        customerResult.getSellerANDCustomerStoreCredits.customerAccountBalance,
                        "Credits should have been deducted from Buyer's account",
                    ).toEqual(customerClaimedBalance - totalPriceCeil);

                    expect(
                        sellerResult.seller?.customFields?.accountBalance,
                        "Credits should have been transferred to Seller's account",
                    ).toEqual(totalPriceCeil - currFee);
                }

                expect(
                    customerResult.getSellerANDCustomerStoreCredits.customerAccountBalance,
                    'Credits have become negative - Something went wrong.',
                ).toBeGreaterThanOrEqual(0);
            }
        });
    });

    it('Should transfer balance to customer account', async () => {
        const transferResult = await adminClient.query(TransferFromSellerToCustomerDocument, {
            value: 1000,
            sellerId: sellerId,
        });

        expect(transferResult.transferCreditfromSellerToCustomer.customerAccountBalance).toEqual(1000);
    });

    it('Should fail for credit exchange above max amount', async () => {
        adminClient.setChannelToken('seller2ch');
        expect(async () => {
            await adminClient.query(RequestCreditExchangeDocument, { amount: 100000 });
        }).rejects.toThrowError();
    });

    let exchangeId: string = '';

    it('Should request credit exchange', async () => {
        adminClient.setChannelToken('seller2ch');
        const beforeBalance = await adminClient
            .query(GetSellerDocument, { id: sellerId })
            .then(res => res.seller?.customFields?.accountBalance || 0);
        const exchangeResponse = await adminClient.query(RequestCreditExchangeDocument, {
            amount: 50000,
        });
        const afterBalance = await adminClient
            .query(GetSellerDocument, { id: sellerId })
            .then(res => res.seller?.customFields?.accountBalance || 0);

        expect(exchangeResponse.requestCreditExchange.id).toBeDefined();
        expect(exchangeResponse.requestCreditExchange.status).toBe('Pending');
        expect(beforeBalance - afterBalance, 'Balance must be deducted').toBe(50000);
        expect(exchangeResponse.requestCreditExchange.amount, 'Should deduct exchange fee').toBe(49900);
        exchangeId = exchangeResponse.requestCreditExchange.id;
        adminClient.setChannelToken('');
    });

    it('Should create payout variant under NPP', async () => {
        const products = await adminClient
            .query(GetProductsDocument, {
                options: { filter: { slug: { eq: 'store-credits' } } },
            })
            .then(res => res.products.items);
        expect(products).toHaveLength(1);
        const option = products[0].optionGroups
            .find(og => og.options.some(o => o.code == 'payout'))
            ?.options.find(o => o.code == 'payout');
        expect(option).toBeDefined();
        const createProductResult = await adminClient.query(CreateProductVariantDocument, {
            input: [
                {
                    sku: 'Payout',
                    trackInventory: GlobalFlag.FALSE,
                    optionIds: [option!.id],
                    productId: products[0].id,
                    translations: [{ languageCode: LanguageCode.en, name: 'Payout' }],
                },
            ],
        });
        expect(createProductResult.createProductVariants).toHaveLength(1);
        expect(createProductResult.createProductVariants[0].id).toBeDefined();
    });

    it('Should accept exchange request', async () => {
        const acceptResponse = await adminClient.query(AcceptCreditExchangeDocument, { id: exchangeId });
        expect(acceptResponse.initiateCreditExchange.code).toBeDefined();
        expect(acceptResponse.initiateCreditExchange.lines).toHaveLength(1);
        expect(acceptResponse.initiateCreditExchange.lines[0].productVariant.options).toEqual(
            expect.arrayContaining([expect.objectContaining({ code: 'payout' })]),
        );
    });

    it('Should fail to refund after already accepting request', async () => {
        expect(async () => {
            await adminClient.query(RefundCreditExchangeDocument, {
                id: exchangeId,
            });
        }).rejects.toThrowError();
    });

    it('Should update exchange status to pending', async () => {
        const updateStatusResult = await adminClient.query(UpdateCreditExchangeStatusDocument, {
            ids: [exchangeId],
            status: 'Pending',
        });
        expect(updateStatusResult.updateCreditExchangeStatus).toBe(1);
    });

    it('Should refund the amount after status updated to pending', async () => {
        const beforeBalance = await adminClient
            .query(GetSellerDocument, { id: sellerId })
            .then(res => res.seller?.customFields?.accountBalance || 0);
        const refundResult = await adminClient.query(RefundCreditExchangeDocument, {
            id: exchangeId,
        });
        const afterBalance = await adminClient
            .query(GetSellerDocument, { id: sellerId })
            .then(res => res.seller?.customFields?.accountBalance || 0);

        expect(refundResult.refundCreditExchange.status).toBe('Refunded');
        expect(afterBalance - beforeBalance, 'Balance must be refunded').toBe(50000);
    });
});
