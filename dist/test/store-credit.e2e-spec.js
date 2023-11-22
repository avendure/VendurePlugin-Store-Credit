"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@vendure/testing");
const vitest_1 = require("vitest");
const index_1 = require("../src/index");
const core_1 = require("@vendure/core");
const path_1 = __importDefault(require("path"));
const initial_data_1 = require("./fixtures/initial-data");
const generated_admin_types_1 = require("./graphql/generated-admin-types");
const generated_shop_types_1 = require("./graphql/generated-shop-types");
(0, testing_1.registerInitializer)("sqljs", new testing_1.SqljsInitializer("__data__"));
(0, vitest_1.describe)("store-credits plugin", () => {
    const devConfig = (0, core_1.mergeConfig)(testing_1.testConfig, {
        plugins: [index_1.StoreCreditPlugin],
    });
    const { server, adminClient, shopClient } = (0, testing_1.createTestEnvironment)(devConfig);
    let started = false;
    let customers = [];
    let sellerId = "";
    let channelId = "";
    (0, vitest_1.beforeAll)(async () => {
        await server.init({
            productsCsvPath: path_1.default.join(__dirname, "fixtures/products.csv"),
            initialData: initial_data_1.initialData,
            customerCount: 2,
        });
        await adminClient.asSuperAdmin();
        customers = await adminClient
            .query(generated_admin_types_1.GetCustomerListDocument, {
            options: { take: 2 },
        })
            .then((c) => c.customers.items);
        started = true;
    }, 60000);
    (0, vitest_1.afterAll)(async () => {
        await server.destroy();
    });
    (0, vitest_1.it)("Should start successfully", () => {
        (0, vitest_1.expect)(started).toEqual(true);
        (0, vitest_1.expect)(customers).toHaveLength(2);
    });
    (0, vitest_1.it)("Should create new seller", async () => {
        var _a;
        const user = customers[0].user;
        const createSellerResult = await adminClient.query(generated_admin_types_1.CreateSellerDocument, {
            input: { name: "Seller 2", customFields: { userId: user.id } },
        });
        (0, vitest_1.expect)(createSellerResult.createSeller.id).toBeDefined();
        (0, vitest_1.expect)((_a = createSellerResult.createSeller.customFields) === null || _a === void 0 ? void 0 : _a.user).toEqual({
            id: user.id,
            identifier: user.identifier,
        });
        sellerId = createSellerResult.createSeller.id;
    });
    // it("Should set seller's user", async () => {
    //   const user = customers[0].user!;
    //   const setSellerResult = await adminClient.query(SetSellerUserDocument, {
    //     input: { id: "T_1", customFields: { userId: user.id } },
    //   });
    //   expect(setSellerResult.updateSeller.customFields?.user).toEqual({
    //     id: user.id,
    //     identifier: user.identifier,
    //   });
    // });
    (0, vitest_1.it)("Should create new channel with seller", async () => {
        const createChannelResult = await adminClient.query(generated_admin_types_1.CreateChannelDocument, {
            input: {
                code: "seller2-ch",
                token: "seller2ch",
                sellerId: sellerId,
                defaultTaxZoneId: "T_1",
                availableLanguageCodes: [generated_admin_types_1.LanguageCode.en],
                pricesIncludeTax: false,
                trackInventory: true,
                defaultLanguageCode: generated_admin_types_1.LanguageCode.en,
                defaultShippingZoneId: "T_1",
                defaultCurrencyCode: generated_admin_types_1.CurrencyCode.USD,
                availableCurrencyCodes: [generated_admin_types_1.CurrencyCode.USD],
            },
        });
        (0, vitest_1.expect)(createChannelResult.createChannel.__typename).toEqual("Channel");
        if (createChannelResult.createChannel.__typename == "Channel") {
            (0, vitest_1.expect)(createChannelResult.createChannel.code).toBeDefined();
            channelId = createChannelResult.createChannel.id;
        }
    });
    (0, vitest_1.it)("Should assign product to channel", async () => {
        const assignResult = await adminClient.query(generated_admin_types_1.AssignProductToChannelDocument, {
            input: { channelId, productIds: ["T_1"], priceFactor: 1 },
        });
        (0, vitest_1.expect)(assignResult.assignProductsToChannel).toHaveLength(1);
        (0, vitest_1.expect)(assignResult.assignProductsToChannel[0].id).toEqual("T_1");
    });
    (0, vitest_1.it)("Should create store credit", async () => {
        const createResult = await adminClient.query(generated_admin_types_1.CreateStoreCreditDocument, {
            input: {
                key: "abcdef",
                value: 10000,
            },
        });
        (0, vitest_1.expect)(createResult.createStoreCredit).toEqual({
            key: "abcdef",
            value: 10000,
            isClaimed: false,
        });
    });
    (0, vitest_1.it)("Should claim store credit", async () => {
        await shopClient.asUserWithCredentials(customers[1].emailAddress, "test");
        const result = await shopClient.query(generated_shop_types_1.ClaimCreditDocument, {
            key: "abcdef",
        });
        (0, vitest_1.expect)(result.claim).toEqual({
            isClaimed: true,
            key: "abcdef",
            value: 10000,
        });
    });
    (0, vitest_1.it)("Should fail transfer with empty balance", async () => {
        (0, vitest_1.expect)(async () => {
            await adminClient.query(generated_admin_types_1.TransferFromSellerToCustomerDocument, {
                value: 1000,
                sellerId: "T_1",
            });
        }).rejects.toThrowError("Insufficient balance");
    });
    (0, vitest_1.describe)("Purchase with store-credit", async () => {
        (0, vitest_1.beforeAll)(async () => {
            await shopClient.asUserWithCredentials(customers[1].emailAddress, "test");
        });
        (0, vitest_1.it)("Should place an order", async () => {
            const addProductResult = await shopClient.query(generated_shop_types_1.AddProductToOrderDocument, {
                productVariantId: "T_1",
                quantity: 1,
            });
            (0, vitest_1.expect)(addProductResult.addItemToOrder.__typename).toEqual("Order");
            if (addProductResult.addItemToOrder.__typename == "Order") {
                (0, vitest_1.expect)(addProductResult.addItemToOrder.code).toBeDefined();
            }
        });
        (0, vitest_1.it)("Should set shipping/billing address, shipping method and transition order", async () => {
            var _a;
            const shippingAddressResult = await shopClient.query(generated_shop_types_1.SetShippingAddressDocument, {
                input: {
                    countryCode: "GB",
                    streetLine1: "68 Farnborough Rd",
                    city: "Farnborough",
                    postalCode: "GU14 6TH",
                    province: "Hampshire",
                },
            });
            (0, vitest_1.expect)(shippingAddressResult.setOrderShippingAddress.__typename).toEqual("Order");
            const billingAddressResult = await shopClient.query(generated_shop_types_1.SetBillingAddressDocument, {
                input: {
                    countryCode: "GB",
                    streetLine1: "68 Farnborough Rd",
                    city: "Farnborough",
                    postalCode: "GU14 6TH",
                    province: "Hampshire",
                },
            });
            (0, vitest_1.expect)(billingAddressResult.setOrderBillingAddress.__typename).toEqual("Order");
            const shippingMethodResult = await shopClient.query(generated_shop_types_1.SetShippingMethodDocument, { ids: "T_1" });
            (0, vitest_1.expect)(shippingMethodResult.setOrderShippingMethod.__typename).toEqual("Order");
            const transitionResult = await shopClient.query(generated_shop_types_1.TransitionToStateDocument, { state: "ArrangingPayment" });
            (0, vitest_1.expect)((_a = transitionResult.transitionOrderToState) === null || _a === void 0 ? void 0 : _a.__typename).toEqual("Order");
        });
        (0, vitest_1.it)("Should add payment", async () => {
            const addPaymentReuslt = await shopClient.query(generated_shop_types_1.AddPaymentToOrderDocument, {
                input: { method: "store-credit", metadata: {} },
            });
            (0, vitest_1.expect)(addPaymentReuslt.addPaymentToOrder.__typename).toEqual("Order");
            if (addPaymentReuslt.addPaymentToOrder.__typename == "Order") {
                (0, vitest_1.expect)(addPaymentReuslt.addPaymentToOrder.state).toEqual("PaymentSettled");
            }
        });
        (0, vitest_1.it)("Should add credits to seller's account", async () => {
            var _a, _b;
            const sellerResult = await adminClient.query(generated_admin_types_1.GetSellerDocument, {
                id: sellerId,
            });
            (0, vitest_1.expect)((_b = (_a = sellerResult.seller) === null || _a === void 0 ? void 0 : _a.customFields) === null || _b === void 0 ? void 0 : _b.accountBalance).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.it)("Should transfer balance to customer account", async () => {
        const transferResult = await adminClient.query(generated_admin_types_1.TransferFromSellerToCustomerDocument, {
            value: 1000,
            sellerId: sellerId,
        });
        (0, vitest_1.expect)(transferResult.transferCreditfromSellerToCustomer.customerAccountBalance).toEqual(1000);
    });
});
