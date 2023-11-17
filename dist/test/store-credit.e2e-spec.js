"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@vendure/testing");
const vitest_1 = require("vitest");
const index_1 = require("../src/index");
const core_1 = require("@vendure/core");
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const randombytes_1 = __importDefault(require("randombytes"));
(0, testing_1.registerInitializer)("sqljs", new testing_1.SqljsInitializer("__data__"));
// Edit following constants to test
const customerUsername = "hero@zero.com";
const customerPassword = "newPass123";
const sellerId = "T_2";
const key = (0, randombytes_1.default)(6).toString("hex");
const value = 100;
// provide product variant id and quantity when testing
const variantId = "T_1";
const quantity = 1;
const addressInput = {
    streetLine1: "test",
    countryCode: "US",
};
// the code you have set while creating payment method
const creditPaymentCode = "store-credit";
(0, vitest_1.describe)("store-credits plugin", () => {
    const { server, adminClient, shopClient } = (0, testing_1.createTestEnvironment)({
        ...testing_1.testConfig,
        plugins: [index_1.StoreCreditPlugin],
    });
    // Query account balance from admin ui
    (0, vitest_1.it)("Superadmin: Returns Seller and Customer StoreCredits", async () => {
        await adminClient.asSuperAdmin(); // log in as the SuperAdmin user
        const query = (0, graphql_tag_1.default) `
			query getSellerANDCustomerStoreCredits($sellerId: ID!) {
				getSellerANDCustomerStoreCredits(sellerId: $sellerId) {
					customerAccountBalance
					sellerAccountBalance
				}
			}
		`;
        let result = await adminClient.query(query, {
            sellerId: sellerId,
        });
        result = result.getSellerANDCustomerStoreCredits;
        core_1.Logger.info(result);
        (0, vitest_1.expect)(result).toEqual({
            customerAccountBalance: typeof result.customerAccountBalance === "number"
                ? result.customerAccountBalance
                : 0,
            sellerAccountBalance: typeof result.sellerAccountBalance === "number"
                ? result.sellerAccountBalance
                : 0,
        });
    });
    // create store credit mutation
    (0, vitest_1.it)("Superadmin: creates a store credit", async () => {
        await adminClient.asSuperAdmin(); // log in as the SuperAdmin user
        const mutation = (0, graphql_tag_1.default) `
			mutation createStoreCredit($input: StoreCreditAddInput!) {
				createStoreCredit(input: $input) {
					key
					value
					isClaimed
				}
			}
		`;
        const result = await adminClient.query(mutation, {
            input: {
                key: key,
                value: value,
            },
        });
        core_1.Logger.info(result.createStoreCredit);
        (0, vitest_1.expect)(result.createStoreCredit).toBeTypeOf("object");
        (0, vitest_1.expect)(result.createStoreCredit).toEqual({
            key: key,
            value: value,
            isClaimed: false,
        });
    });
    // claim store credit mutation
    (0, vitest_1.it)("Buyer: claims a store credit", async () => {
        await shopClient.asUserWithCredentials(customerUsername, customerPassword); // log in as the SuperAdmin user
        const mutation = (0, graphql_tag_1.default) `
			mutation claim($key: String!) {
				claim(key: $key) {
					key
					value
					isClaimed
				}
			}
		`;
        const result = await shopClient.query(mutation, {
            key: key,
        });
        core_1.Logger.info(result.claim);
        (0, vitest_1.expect)(result.claim).toBeTypeOf("object");
        (0, vitest_1.expect)(result.claim).toEqual({
            isClaimed: true,
            key: key,
            value: value,
        });
    });
    // Transfer credit Query, provide value and sellerId when testing
    (0, vitest_1.it)("Superadmin: transfers Credit from Seller To Customer", async () => {
        await adminClient.asSuperAdmin(); // log in as the customer user
        const query = (0, graphql_tag_1.default) `
			query transferCreditfromSellerToCustomer($value: Int!, $sellerId: ID!) {
				transferCreditfromSellerToCustomer(value: $value, sellerId: $sellerId) {
					customerAccountBalance
					sellerAccountBalance
				}
			}
		`;
        let result = await adminClient.query(query, {
            value: 10,
            sellerId: sellerId,
        });
        result = result.transferCreditfromSellerToCustomer;
        (0, vitest_1.expect)(result).toEqual({
            customerAccountBalance: typeof result.customerAccountBalance === "number"
                ? result.customerAccountBalance
                : 0,
            sellerAccountBalance: typeof result.sellerAccountBalance === "number"
                ? result.sellerAccountBalance
                : 0,
        });
    });
    // customer credit less than total amount purchase fails
    (0, vitest_1.it)("Buyer: fails/pass to purchase product with in/sufficient credit", async () => {
        var _a;
        await shopClient.asUserWithCredentials(customerUsername, customerPassword); // log in as the customer user
        const mutation = (0, graphql_tag_1.default) `
			mutation addProductToOrder($productVariantId: ID!, $quantity: Int!) {
				addItemToOrder(
					productVariantId: $productVariantId
					quantity: $quantity
				) {
					__typename
				}
			}
		`;
        const result = await shopClient.query(mutation, {
            productVariantId: variantId,
            quantity,
        });
        core_1.Logger.info(result.addItemToOrder);
        (0, vitest_1.expect)(result.addItemToOrder).toBeTypeOf("object");
        if (result.addItemToOrder.__typename !== "OrderModificationError") {
            (0, vitest_1.expect)(result.addItemToOrder).toEqual({
                __typename: "Order",
            });
            const mutation2 = (0, graphql_tag_1.default) `
				mutation SetOrderShippingAddress($input: CreateAddressInput!) {
					setOrderShippingAddress(input: $input) {
						__typename
					}
				}
			`;
            const result2 = await shopClient.query(mutation2, {
                input: addressInput,
            });
            core_1.Logger.info(result2.setOrderShippingAddress);
            (0, vitest_1.expect)(result2.setOrderShippingAddress).toBeTypeOf("object");
            (0, vitest_1.expect)(result2.setOrderShippingAddress).toEqual({
                __typename: "Order",
            });
            const mutation3 = (0, graphql_tag_1.default) `
				mutation SetOrderBillingAddress($input: CreateAddressInput!) {
					setOrderBillingAddress(input: $input) {
						__typename
					}
				}
			`;
            const result3 = await shopClient.query(mutation3, {
                input: addressInput,
            });
            core_1.Logger.info(result3.setOrderBillingAddress);
            (0, vitest_1.expect)(result3.setOrderBillingAddress).toBeTypeOf("object");
            (0, vitest_1.expect)(result3.setOrderBillingAddress).toEqual({
                __typename: "Order",
            });
            const query1 = (0, graphql_tag_1.default) `
				query EligibleShippingMethods {
					eligibleShippingMethods {
						id
						name
					}
				}
			`;
            const result4 = await shopClient.query(query1);
            console.log(result4.eligibleShippingMethods[0].id);
            (0, vitest_1.expect)(result4.eligibleShippingMethods).toBeTypeOf("object");
            const mutation4 = (0, graphql_tag_1.default) `
				mutation SetOrderShippingMethod($shippingMethodId: [ID!]!) {
					setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
						__typename
					}
				}
			`;
            const result5 = await shopClient.query(mutation4, {
                shippingMethodId: [result4.eligibleShippingMethods[0].id],
            });
            (0, vitest_1.expect)(result5.setOrderShippingMethod).toBeTypeOf("object");
            (0, vitest_1.expect)(result5.setOrderShippingMethod).toEqual({
                __typename: "Order",
            });
            const mutation5 = (0, graphql_tag_1.default) `
				mutation TransitionOrderToState($state: String!) {
					transitionOrderToState(state: $state) {
						__typename
					}
				}
			`;
            const result6 = await shopClient.query(mutation5, {
                state: "ArrangingPayment",
            });
            (0, vitest_1.expect)(result6.transitionOrderToState).toBeTypeOf("object");
            (0, vitest_1.expect)(result6.transitionOrderToState).toEqual({
                __typename: "Order",
            });
        }
        const query2 = (0, graphql_tag_1.default) `
			query EligiblePaymentMethods {
				eligiblePaymentMethods {
					code
					isEligible
				}
			}
		`;
        const result7 = await shopClient.query(query2);
        (0, vitest_1.expect)(result7.eligiblePaymentMethods).toBeTypeOf("object");
        (0, vitest_1.expect)(result7.eligiblePaymentMethods).toContainEqual({
            code: "credit",
            isEligible: true,
        });
        // query for total amount
        const query3 = (0, graphql_tag_1.default) `
			query ActiveOrder {
				activeOrder {
					id
					state
					total
					shippingWithTax
					subTotal
					subTotalWithTax
					totalWithTax
				}
			}
		`;
        const result9 = await shopClient
            .query(query3)
            .then((res) => res.activeOrder);
        const totalAmount = result9.totalWithTax / 100;
        // query for customer account balance
        const query4 = (0, graphql_tag_1.default) `
			query ActiveCustomer {
				activeCustomer {
					customFields {
						accountBalance
					}
				}
			}
		`;
        const result10 = await shopClient
            .query(query4)
            .then((res) => res.activeCustomer);
        const customerAccountBalance = (_a = result10.customFields) === null || _a === void 0 ? void 0 : _a.accountBalance;
        // console.log(customerAccountBalance, totalAmount);
        const mutation6 = (0, graphql_tag_1.default) `
			mutation AddPaymentToOrder($input: PaymentInput!) {
				addPaymentToOrder(input: $input) {
					__typename
					... on PaymentFailedError {
						message
						paymentErrorMessage
						errorCode
					}
					... on PaymentDeclinedError {
						message
						paymentErrorMessage
						errorCode
					}
					... on OrderPaymentStateError {
						message
						errorCode
					}
					... on IneligiblePaymentMethodError {
						message
						eligibilityCheckerMessage
					}
				}
			}
		`;
        const result8 = await shopClient.query(mutation6, {
            input: {
                method: creditPaymentCode,
                metadata: {},
            },
        });
        (0, vitest_1.expect)(result8.addPaymentToOrder).toBeTypeOf("object");
        if (customerAccountBalance && customerAccountBalance < totalAmount) {
            (0, vitest_1.expect)(result8.addPaymentToOrder).toEqual({
                __typename: "PaymentDeclinedError",
                message: "The payment was declined",
                paymentErrorMessage: "Insufficient Balance",
                errorCode: "PAYMENT_DECLINED_ERROR",
            });
        }
        else {
            (0, vitest_1.expect)(result8.addPaymentToOrder).toEqual({
                __typename: "Order",
            });
        }
        if (result8.addPaymentToOrder.__typename !== "Order") {
            console.log("Setup Seller correctly.", result8.addPaymentToOrder);
        }
    });
    (0, vitest_1.afterAll)(async () => {
        await server.destroy();
    });
});
