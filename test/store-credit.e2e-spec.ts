import {
	SqljsInitializer,
	registerInitializer,
	createTestEnvironment,
	testConfig,
} from "@vendure/testing";
import { it, describe, afterAll, expect, beforeAll } from "vitest";
import { StoreCreditPlugin } from "../src/index";
import { mergeConfig } from "@vendure/core";
import path from "path";
import { initialData } from "./fixtures/initial-data";
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
} from "./graphql/generated-admin-types";
import {
	AddProductToOrderDocument,
	ClaimCreditDocument,
	SetShippingAddressDocument,
	SetBillingAddressDocument,
	SetShippingMethodDocument,
	TransitionToStateDocument,
	AddPaymentToOrderDocument,
	GetBalanceDocument,
} from "./graphql/generated-shop-types";

registerInitializer("sqljs", new SqljsInitializer("__data__"));

describe("store-credits plugin", () => {
	const devConfig = mergeConfig(testConfig, {
		plugins: [
			StoreCreditPlugin.init({ creditToCurrencyFactor: { default: 1 } }),
		],
	});
	const { server, adminClient, shopClient } = createTestEnvironment(devConfig);
	let started = false;
	let customers: GetCustomerListQuery["customers"]["items"] = [];
	let sellerId: string = "";
	let channelId: string = "";
	let creditKey: string = "";
	let customerClaimedBalance = 1600;

	beforeAll(async () => {
		await server.init({
			productsCsvPath: path.join(__dirname, "fixtures/products.csv"),
			initialData: initialData,
			customerCount: 2,
		});
		await adminClient.asSuperAdmin();

		customers = await adminClient
			.query(GetCustomerListDocument, {
				options: { take: 2 },
			})
			.then((c) => c.customers.items);

		started = true;
	}, 60000);

	afterAll(async () => {
		await server.destroy();
	});

	it("Should start successfully", () => {
		expect(started).toEqual(true);
		expect(customers).toHaveLength(2);
	});

	it("Should create new seller", async () => {
		const user = customers[0].user!;
		const createSellerResult = await adminClient.query(CreateSellerDocument, {
			input: { name: "Seller 2", customFields: { userId: user.id } },
		});
		expect(createSellerResult.createSeller.id).toBeDefined();
		expect(createSellerResult.createSeller.customFields?.user).toEqual({
			id: user.id,
			identifier: user.identifier,
		});
		sellerId = createSellerResult.createSeller.id;
	});

	// we are already setting the seller's user in other test,
	//  so it's not necessary to re-set the user:
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

	it("Should create new channel with seller", async () => {
		const createChannelResult = await adminClient.query(CreateChannelDocument, {
			input: {
				code: "seller2-ch",
				token: "seller2ch",
				sellerId: sellerId,
				defaultTaxZoneId: "T_1",
				availableLanguageCodes: [LanguageCode.en],
				pricesIncludeTax: false,
				trackInventory: true,
				defaultLanguageCode: LanguageCode.en,
				defaultShippingZoneId: "T_1",
				defaultCurrencyCode: CurrencyCode.USD,
				availableCurrencyCodes: [CurrencyCode.USD],
			},
		});
		expect(createChannelResult.createChannel.__typename).toEqual("Channel");
		if (createChannelResult.createChannel.__typename == "Channel") {
			expect(createChannelResult.createChannel.code).toBeDefined();
			channelId = createChannelResult.createChannel.id;
		}
	});

	it("Should assign product to channel", async () => {
		const assignResult = await adminClient.query(
			AssignProductVariantsToChannelDocument,
			{
				input: { channelId, productVariantIds: ["T_1"], priceFactor: 1 },
			}
		);
		expect(assignResult.assignProductVariantsToChannel).toHaveLength(1);
		expect(assignResult.assignProductVariantsToChannel[0].id).toEqual("T_1");
	});

	it("Should create store credit for purchase", async () => {
		const createResult = await adminClient.query(CreateStoreCreditDocument, {
			input: {
				name: "100 Store Credits",
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

	it("Should create store credit for claim by key", async () => {
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
		creditKey = createResult.createStoreCredit.key || "";
	});

	it("Should fail transfer with empty balance", async () => {
		expect(async () => {
			await adminClient.query(TransferFromSellerToCustomerDocument, {
				value: 1000,
				sellerId,
			});
		}).rejects.toThrowError("Insufficient balance");
	});

	describe("Purchase with store-credit", async () => {
		beforeAll(async () => {
			await shopClient.asUserWithCredentials(customers[1].emailAddress, "test");
		});

		it("Should place an order", async () => {
			const addProductResult = await shopClient.query(
				AddProductToOrderDocument,
				{
					productVariantId: "T_1",
					quantity: 1,
				}
			);

			expect(addProductResult.addItemToOrder.__typename).toEqual("Order");
			if (addProductResult.addItemToOrder.__typename == "Order") {
				console.log(
					"AddProductResult total: ",
					addProductResult.addItemToOrder.totalWithTax
				);
				expect(addProductResult.addItemToOrder.code).toBeDefined();
			}
		});

		it("Should set shipping/billing address, shipping method and transition order", async () => {
			const shippingAddressResult = await shopClient.query(
				SetShippingAddressDocument,
				{
					input: {
						countryCode: "GB",
						streetLine1: "68 Farnborough Rd",
						city: "Farnborough",
						postalCode: "GU14 6TH",
						province: "Hampshire",
					},
				}
			);
			expect(shippingAddressResult.setOrderShippingAddress.__typename).toEqual(
				"Order"
			);

			const billingAddressResult = await shopClient.query(
				SetBillingAddressDocument,
				{
					input: {
						countryCode: "GB",
						streetLine1: "68 Farnborough Rd",
						city: "Farnborough",
						postalCode: "GU14 6TH",
						province: "Hampshire",
					},
				}
			);
			expect(billingAddressResult.setOrderBillingAddress.__typename).toEqual(
				"Order"
			);

			const shippingMethodResult = await shopClient.query(
				SetShippingMethodDocument,
				{ ids: "T_1" }
			);
			expect(shippingMethodResult.setOrderShippingMethod.__typename).toEqual(
				"Order"
			);

			const transitionResult = await shopClient.query(
				TransitionToStateDocument,
				{ state: "ArrangingPayment" }
			);
			expect(transitionResult.transitionOrderToState?.__typename).toEqual(
				"Order"
			);
		});

		it("Should fail to add payment with no credits", async () => {
			const addPaymentReuslt = await shopClient.query(
				AddPaymentToOrderDocument,
				{
					input: { method: "store-credit", metadata: {} },
				}
			);
			expect(addPaymentReuslt.addPaymentToOrder.__typename).toEqual(
				"PaymentDeclinedError"
			);
		});

		it("Should claim store credit", async () => {
			await shopClient.asUserWithCredentials(customers[1].emailAddress, "test");
			const result = await shopClient.query(ClaimCreditDocument, {
				key: creditKey,
			});

			expect(result.claim).toEqual({
				success: true,
				message: "Successfully claimed credit",
				addedCredit: customerClaimedBalance,
				currentBalance: customerClaimedBalance,
			});
		});

		it("Should add payment", async () => {
			const addPaymentReuslt = await shopClient.query(
				AddPaymentToOrderDocument,
				{
					input: { method: "store-credit", metadata: {} },
				}
			);

			expect(addPaymentReuslt.addPaymentToOrder.__typename).toEqual("Order");
			if (addPaymentReuslt.addPaymentToOrder.__typename == "Order") {
				expect(
					addPaymentReuslt.addPaymentToOrder.state,
					"Order state should have transitioned"
				).toEqual("PaymentSettled");

				const customerResult = await shopClient.query(GetBalanceDocument);
				const sellerResult = await adminClient.query(GetSellerDocument, {
					id: sellerId,
				});

				expect(
					sellerResult.seller?.customFields?.accountBalance,
					"Credits should have been transferred to Seller's account"
				).toBeGreaterThan(0);

				expect(
					customerResult.getSellerANDCustomerStoreCredits
						.customerAccountBalance,
					"Credits should have been deducted from Buyer's account"
				).toEqual(
					customerClaimedBalance -
						Math.ceil(addPaymentReuslt.addPaymentToOrder.totalWithTax / 100)
				);
				console.log("Customer Claimed Balance: ", customerClaimedBalance);
				console.log(
					"totalWithTax: ",
					addPaymentReuslt.addPaymentToOrder.totalWithTax
				);
				console.log(
					"result: ",
					customerClaimedBalance -
						Math.ceil(addPaymentReuslt.addPaymentToOrder.totalWithTax / 100)
				);

				expect(
					customerResult.getSellerANDCustomerStoreCredits
						.customerAccountBalance,
					"Credits have become negative - Something went wrong."
				).toBeGreaterThanOrEqual(0);
			}
		});
	});

	it("Should transfer balance to customer account", async () => {
		const transferResult = await adminClient.query(
			TransferFromSellerToCustomerDocument,
			{
				value: 1000,
				sellerId: sellerId,
			}
		);

		expect(
			transferResult.transferCreditfromSellerToCustomer.customerAccountBalance
		).toEqual(1000);
	});
});
