"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_SELLER_AND_CUSTOMER_STORE_CREDITS = exports.TRANSFER_CREDIT_FROM_SELLER_TO_CUSTOMER = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const fragment_graphql_1 = require("./common/fragment.graphql");
// export const GET_ALL_STORE_CREDITS = gql`
//   query getStoreCreditForSameCustomer {
//     getStoreCreditForSameCustomer {
//       ...StoreCredit
//     }
//   }
//   ${STORE_CREDIT_FRAGMENT}
// `;
exports.TRANSFER_CREDIT_FROM_SELLER_TO_CUSTOMER = (0, graphql_tag_1.default) `
  query transferCreditfromSellerToCustomer($value: Int!, $sellerId: ID!) {
    transferCreditfromSellerToCustomer(value: $value, sellerId: $sellerId) {
      ...AccountBalance
    }
  }
  ${fragment_graphql_1.ACCOUNT_BALANCE_FRAGMENT}
`;
exports.GET_SELLER_AND_CUSTOMER_STORE_CREDITS = (0, graphql_tag_1.default) `
  query getSellerANDCustomerStoreCredits($sellerId: ID!) {
    getSellerANDCustomerStoreCredits(sellerId: $sellerId) {
      ...AccountBalance
    }
  }
  ${fragment_graphql_1.ACCOUNT_BALANCE_FRAGMENT}
`;
