# Store Credits Plugin

Plugin to enable payments through store credits system. This plugin can be used in a multivendor scenario where the superadmin will create the store credits.

Buyers and sellers can transact with store-credit. Platform Fee will diminish credit supply.

##Creating store credit
This plugin extends the admin-ui and adds a "store-credit" section to the side-nav menu. This should be only accessible by users with superadmin permissions

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

- Server should run on port `3050`, so the endpoints are

  ```graphql
  http://localhost:3050/admin
  http://localhost:3050/shop-api
  http://localhost:3050/admin-api
  ```

- `yarn`
- Edit the `.env` file to add the required environment variables.
- `yarn start`
- Edit `test/store-credit.e2e-spec.ts` with required constants.
- `yarn test`
