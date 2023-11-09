import { gql } from 'apollo-server-core';

const commonExtensions = gql`
  type StoreCredit implements Node {
    id: ID!
    key: String
    value: Int
    customerId: String
    isClaimed: Boolean
    createdAt: DateTime
    updatedAt: DateTime
  }

  input StoreCreditAddInput {
    key: String
    value: Int
  }

  type AccountBalance {
    customerAccountBalance: Int
    sellerAccountBalance: Int
  }

  extend type Query {
    storeCredit(id: ID!): StoreCredit!
    customerStoreCredit(id: ID!, customerId: ID!): StoreCredit!
    customerStoreCredits: [StoreCredit!]!
  }
`;

export const shopApiExtensions = gql`
  ${commonExtensions}

  extend type Mutation {
    claim(key: String!): StoreCredit!
  }
`;

export const adminApiExtensions = gql`
  ${commonExtensions}

  input StoreCreditUpdateInput {
    id: ID!
    key: String
    value: Int
  }

  type StoreCreditList implements PaginatedList {
    items: [StoreCredit!]!
    totalItems: Int!
  }

  input StoreCreditListOptions

  extend type Query {
    storeCredits(options: StoreCreditListOptions): StoreCreditList!
    transferCreditfromSellerToCustomer(
      value: Int!
      sellerId: ID!
    ): AccountBalance!
    getSellerANDCustomerStoreCredits(sellerId: ID!): AccountBalance!
  }

  extend type Mutation {
    createStoreCredit(input: StoreCreditAddInput!): StoreCredit!
    updateStoreCredit(input: StoreCreditUpdateInput!): StoreCredit!
    deleteSingleStoreCredit(id: ID!): DeletionResponse!
  }
`;
