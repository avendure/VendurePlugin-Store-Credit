"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_SELLER = exports.ASSIGN_PRODUCT_TO_CHANNEL = exports.CREATE_CHANNEL = exports.CREATE_SELLER = exports.TRANSFER_FROM_SELLER_TO_CUSTOMER = exports.CREATE_STORE_CREDIT = exports.SET_SELLER_USER = exports.GET_CUSTOMER_LIST = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.GET_CUSTOMER_LIST = (0, graphql_tag_1.default) `
  query GetCustomerList($options: CustomerListOptions) {
    customers(options: $options) {
      items {
        id
        title
        firstName
        lastName
        emailAddress
        phoneNumber
        user {
          id
          identifier
        }
      }
      totalItems
    }
  }
`;
exports.SET_SELLER_USER = (0, graphql_tag_1.default) `
  mutation SetSellerUser($input: UpdateSellerInput!) {
    updateSeller(input: $input) {
      customFields {
        user {
          id
          identifier
        }
      }
    }
  }
`;
exports.CREATE_STORE_CREDIT = (0, graphql_tag_1.default) `
  mutation createStoreCredit($input: StoreCreditAddInput!) {
    createStoreCredit(input: $input) {
      key
      value
      isClaimed
    }
  }
`;
exports.TRANSFER_FROM_SELLER_TO_CUSTOMER = (0, graphql_tag_1.default) `
  mutation TransferFromSellerToCustomer($value: Int!, $sellerId: ID!) {
    transferCreditfromSellerToCustomer(value: $value, sellerId: $sellerId) {
      customerAccountBalance
      sellerAccountBalance
    }
  }
`;
exports.CREATE_SELLER = (0, graphql_tag_1.default) `
  mutation CreateSeller($input: CreateSellerInput!) {
    createSeller(input: $input) {
      id
      customFields {
        user {
          id
          identifier
        }
      }
    }
  }
`;
exports.CREATE_CHANNEL = (0, graphql_tag_1.default) `
  mutation CreateChannel($input: CreateChannelInput!) {
    createChannel(input: $input) {
      __typename
      ... on Channel {
        id
        code
      }
    }
  }
`;
exports.ASSIGN_PRODUCT_TO_CHANNEL = (0, graphql_tag_1.default) `
  mutation AssignProductToChannel($input: AssignProductsToChannelInput!) {
    assignProductsToChannel(input: $input) {
      id
    }
  }
`;
exports.GET_SELLER = (0, graphql_tag_1.default) `
  query GetSeller($id: ID!) {
    seller(id: $id) {
      id
      customFields {
        accountBalance
      }
    }
  }
`;
