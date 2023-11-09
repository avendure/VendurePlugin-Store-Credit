# Store Credits Plugin

Plugin to enable payments through store credits system.

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

Add the plugin in `vendure-config.ts` file and uiExtensions in `compile-admin-ui.ts` file.

### Run tests

- Server should run on port `3050`, edit `vendure-config.ts` files api config option,
  ```
  apiOptions: {
    ...otherOptions,
    port: 3050
  }
  ```
- `yarn add @vendure/testing vitest graphql-tag @swc/core unplugin-swc randombytes`
- `yarn add -D @types/randombytes`
- `yarn test`
