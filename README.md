# Store Credits Plugin

Plugin to enable payments through store credits system. This plugin can be used in a multivendor scenario where the superadmin will create the store credits.

Buyers and sellers can transact with store-credit. Platform Fee will diminish credit supply.

##Creating store credit

This plugin extends the admin-ui and adds a "store-credit" section to the side-nav menu. This should be only accessible by users with superadmin permissions

##instructions

1. Modify the mv.service.ts file in the default Multivendor plugin from Vendure
You should include the following lines in the `registerNewSeller()` function. These will link the customer account with the seller account:
```
const sellerCustomer = await this.connection
      .getRepository(ctx, Customer)
      .findOne({
        where: { emailAddress: input.seller.emailAddress },
      });

if (!sellerCustomer) {
    throw new InternalServerError(
     "Customer Account Is not created. Can't create Seller account.",
    );
}

//Link Seller account with customer account
await this.sellerService.update(ctx, {
	id: channel.sellerId as ID,
	customFields: {
		customerId: sellerCustomer?.id,
	},
});
```

2. You must register the customer account before the seller account
You must register the customer account before registering the seller. Pass them the same email address. This will link to two accounts so that credit can be transferred between them.

E.g. On registration, you should call:
```
registerCustomerAccount(input: $input) {
	__typename
	... on Success {
		success
	}
	... on ErrorResult {
		errorCode
		message
	}
}
```
Followed by:
```
registerNewSeller(input: $input) {
	__typename
	id
	code
	token
}
```

## Shop APIs

`Query`

```graphql
storeCredit(id: ID!): StoreCredit!
customerStoreCredit(id: ID!, customerId: ID!): StoreCredit!
customerStoreCredits: [StoreCredit!]!
```

## Admin APIs

`Query`

```graphql
storeCredits(options: StoreCreditListOptions): StoreCreditList!
transferCreditfromSellerToCustomer(
  value: Int!
  sellerId: ID!
  ): AccountBalance!
getSellerANDCustomerStoreCredits(sellerId: ID!): AccountBalance!
```

`Mutation`

```graphql
createStoreCredit(input: StoreCreditAddInput!): StoreCredit!
updateStoreCredit(input: StoreCreditUpdateInput!): StoreCredit!
deleteSingleStoreCredit(id: ID!): DeletionResponse!
```

## Installation

-   Server should run on port `3050`, so the endpoints are

    ```graphql
    http://localhost:3050/admin
    http://localhost:3050/shop-api
    http://localhost:3050/admin-api
    ```

-   `yarn`
-   Edit the `.env` file to add the required environment variables.
-   `yarn start`
-   Edit `test/store-credit.e2e-spec.ts` with required constants.
-   `yarn test`

## Errors

I commonly see `Serialized Error: { code: 'EADDRINUSE', errno: -98, syscall: 'listen', address: '::', port: 3050 }`
To get around this, I have to run: `sudo lsof -i :3050` to find which process is using 3050. Then I run, `kill -9 pid` where pid is the process id.
