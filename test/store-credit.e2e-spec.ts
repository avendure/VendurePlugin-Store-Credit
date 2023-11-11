import {
	PostgresInitializer,
	SqljsInitializer,
	registerInitializer,
	createTestEnvironment,
	testConfig,
} from "@vendure/testing";
import { it, describe, afterAll, expect } from "vitest";
import { StoreCreditPlugin } from "../src/index";
import { Logger, Order } from "@vendure/core";
import gql from "graphql-tag";
import { Customer } from "@vendure/common/lib/generated-shop-types";
import randombytes from "randombytes";

registerInitializer("sqljs", new SqljsInitializer("__data__"));
// Edit following constants to test
const customerUsername = "hero@zero.com";
const customerPassword = "newPass123";
const sellerId = "T_2";
const key = randombytes(6).toString("hex");
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

describe("store-credits plugin", () => {
	const { server, adminClient, shopClient } = createTestEnvironment({
		...testConfig,
		plugins: [StoreCreditPlugin],
	});

	// Query account balance from admin ui
	it("Superadmin: Returns Seller and Customer StoreCredits", async () => {
		await adminClient.asSuperAdmin(); // log in as the SuperAdmin user

		const query = gql`
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
		Logger.info(result);
		expect(result).toEqual({
			customerAccountBalance:
				typeof result.customerAccountBalance === "number"
					? result.customerAccountBalance
					: 0,
			sellerAccountBalance:
				typeof result.sellerAccountBalance === "number"
					? result.sellerAccountBalance
					: 0,
		});
	});

	// create store credit mutation
	it("Superadmin: creates a store credit", async () => {
		await adminClient.asSuperAdmin(); // log in as the SuperAdmin user

		const mutation = gql`
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
		Logger.info(result.createStoreCredit);
		expect(result.createStoreCredit).toBeTypeOf("object");
		expect(result.createStoreCredit).toEqual({
			key: key,
			value: value,
			isClaimed: false,
		});
	});

	// claim store credit mutation
	it("Buyer: claims a store credit", async () => {
		await shopClient.asUserWithCredentials(customerUsername, customerPassword); // log in as the SuperAdmin user

		const mutation = gql`
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
		Logger.info(result.claim);
		expect(result.claim).toBeTypeOf("object");
		expect(result.claim).toEqual({
			isClaimed: true,
			key: key,
			value: value,
		});
	});

	// Transfer credit Query, provide value and sellerId when testing
	it("Superadmin: transfers Credit from Seller To Customer", async () => {
		await adminClient.asSuperAdmin(); // log in as the customer user

		const query = gql`
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
		expect(result).toEqual({
			customerAccountBalance:
				typeof result.customerAccountBalance === "number"
					? result.customerAccountBalance
					: 0,
			sellerAccountBalance:
				typeof result.sellerAccountBalance === "number"
					? result.sellerAccountBalance
					: 0,
		});
	});

	// customer credit less than total amount purchase fails
	it("Buyer: fails/pass to purchase product with in/sufficient credit", async () => {
		await shopClient.asUserWithCredentials(customerUsername, customerPassword); // log in as the customer user

		const mutation = gql`
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
		Logger.info(result.addItemToOrder);
		expect(result.addItemToOrder).toBeTypeOf("object");
		if (result.addItemToOrder.__typename !== "OrderModificationError") {
			expect(result.addItemToOrder).toEqual({
				__typename: "Order",
			});
			const mutation2 = gql`
				mutation SetOrderShippingAddress($input: CreateAddressInput!) {
					setOrderShippingAddress(input: $input) {
						__typename
					}
				}
			`;
			const result2 = await shopClient.query(mutation2, {
				input: addressInput,
			});
			Logger.info(result2.setOrderShippingAddress);
			expect(result2.setOrderShippingAddress).toBeTypeOf("object");
			expect(result2.setOrderShippingAddress).toEqual({
				__typename: "Order",
			});

			const mutation3 = gql`
				mutation SetOrderBillingAddress($input: CreateAddressInput!) {
					setOrderBillingAddress(input: $input) {
						__typename
					}
				}
			`;
			const result3 = await shopClient.query(mutation3, {
				input: addressInput,
			});
			Logger.info(result3.setOrderBillingAddress);
			expect(result3.setOrderBillingAddress).toBeTypeOf("object");
			expect(result3.setOrderBillingAddress).toEqual({
				__typename: "Order",
			});

			const query1 = gql`
				query EligibleShippingMethods {
					eligibleShippingMethods {
						id
						name
					}
				}
			`;
			const result4 = await shopClient.query(query1);
			console.log(result4.eligibleShippingMethods[0].id);
			expect(result4.eligibleShippingMethods).toBeTypeOf("object");

			const mutation4 = gql`
				mutation SetOrderShippingMethod($shippingMethodId: [ID!]!) {
					setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
						__typename
					}
				}
			`;
			const result5 = await shopClient.query(mutation4, {
				shippingMethodId: [result4.eligibleShippingMethods[0].id as string],
			});
			expect(result5.setOrderShippingMethod).toBeTypeOf("object");
			expect(result5.setOrderShippingMethod).toEqual({
				__typename: "Order",
			});

			const mutation5 = gql`
				mutation TransitionOrderToState($state: String!) {
					transitionOrderToState(state: $state) {
						__typename
					}
				}
			`;
			const result6 = await shopClient.query(mutation5, {
				state: "ArrangingPayment",
			});
			expect(result6.transitionOrderToState).toBeTypeOf("object");
			expect(result6.transitionOrderToState).toEqual({
				__typename: "Order",
			});
		}

		const query2 = gql`
			query EligiblePaymentMethods {
				eligiblePaymentMethods {
					code
					isEligible
				}
			}
		`;
		const result7 = await shopClient.query(query2);
		expect(result7.eligiblePaymentMethods).toBeTypeOf("object");
		expect(result7.eligiblePaymentMethods).toContainEqual({
			code: "credit",
			isEligible: true,
		});

		// query for total amount
		const query3 = gql`
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
			.then((res) => res.activeOrder as Order);
		const totalAmount = result9.totalWithTax / 100;

		// query for customer account balance
		const query4 = gql`
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
			.then((res) => res.activeCustomer as Customer);
		const customerAccountBalance = result10.customFields?.accountBalance;
		// console.log(customerAccountBalance, totalAmount);

		const mutation6 = gql`
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
		expect(result8.addPaymentToOrder).toBeTypeOf("object");

		if (customerAccountBalance && customerAccountBalance < totalAmount) {
			expect(result8.addPaymentToOrder).toEqual({
				__typename: "PaymentDeclinedError",
				message: "The payment was declined",
				paymentErrorMessage: "Insufficient Balance",
				errorCode: "PAYMENT_DECLINED_ERROR",
			});
		} else {
			expect(result8.addPaymentToOrder).toEqual({
				__typename: "Order",
			});
		}

		if (result8.addPaymentToOrder.__typename !== "Order") {
			console.log("Setup Seller correctly.", result8.addPaymentToOrder);
		}
	});

	afterAll(async () => {
		await server.destroy();
	});
});
