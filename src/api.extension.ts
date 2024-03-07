// import { gql } from 'apollo-server-core';
import gql from 'graphql-tag';

const commonExtensions = gql`
    type StoreCredit implements Node {
        id: ID!
        value: Int
        perUserLimit: Int!
        createdAt: DateTime
        updatedAt: DateTime
    }

    input StoreCreditListOptions

    type StoreCreditList implements PaginatedList {
        items: [StoreCredit!]!
        totalItems: Int!
    }

    type AccountBalance {
        customerAccountBalance: Int
        sellerAccountBalance: Int
    }

    extend type Query {
        storeCredits(options: StoreCreditListOptions): StoreCreditList!
        storeCredit(id: ID!): StoreCredit
    }

    extend type Customer {
        storeCredit: Float!
    }

    extend type Seller {
        storeCredit: Float!
    }
`;

export const shopApiExtensions = gql`
    ${commonExtensions}

    extend type StoreCredit {
        variantId: ID!
        variant: ProductVariant!
    }

    type ClaimResult {
        success: Boolean!
        message: String!
        addedCredit: Int
        currentBalance: Int
    }

    extend type Mutation {
        addCreditToOrder(creditId: ID!, quantity: Int!): UpdateOrderItemsResult
        claim(key: String!): ClaimResult!
    }
`;

export const adminApiExtensions = gql`
    ${commonExtensions}

    extend type StoreCredit {
        variantId: ID
        variant: ProductVariant
        key: String
        customer: Customer
        customerId: ID
    }

    input StoreCreditAddInput {
        name: String
        value: Int!
        price: Int
        perUserLimit: Int!
    }

    input StoreCreditUpdateInput {
        id: ID!
        name: String
        value: Int
        perUserLimit: Int
    }

    type CreditExchange implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        amount: Int!
        status: String!
        order: Order
        orderId: ID
        seller: Seller!
        sellerId: ID!
    }

    type CreditExchangeList implements PaginatedList {
        items: [CreditExchange!]!
        totalItems: Int!
    }

    input CreditExchangeListOptions

    extend type Query {
        creditExchanges(options: CreditExchangeListOptions): CreditExchangeList!
        creditExchange(id: ID!): CreditExchange!
    }

    extend type Mutation {
        transferCreditfromSellerToCustomer(value: Int!, sellerId: ID!): AccountBalance!
        createStoreCredit(input: StoreCreditAddInput!): StoreCredit!
        updateStoreCredit(input: StoreCreditUpdateInput!): StoreCredit!
        deleteSingleStoreCredit(id: ID!): DeletionResponse!
        requestCreditExchange(amount: Int!): CreditExchange!
        updateCreditExchangeStatus(ids: [ID!]!, status: String!): Int!
        initiateCreditExchange(id: ID!): Order!
        refundCreditExchange(id: ID!): CreditExchange!
    }
`;
