"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE_STORE_CREDIT = exports.GET_STORE_CREDIT = exports.GET_ALL_STORE_CREDITS = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const fragments_graphql_1 = require("../../common/fragments.graphql");
exports.GET_ALL_STORE_CREDITS = (0, graphql_tag_1.default) `
  query GetAllStoreCredits($options: StoreCreditListOptions) {
    storeCredits(options: $options) {
      items {
        ...StoreCredits
      }
      totalItems
    }
  }
  ${fragments_graphql_1.STORE_CREDIT_FRAGMENT}
`;
exports.GET_STORE_CREDIT = (0, graphql_tag_1.default) `
  query GetStoreCredit($id: ID!) {
    storeCredit(id: $id) {
      ...StoreCredits
    }
  }
  ${fragments_graphql_1.STORE_CREDIT_FRAGMENT}
`;
exports.DELETE_STORE_CREDIT = (0, graphql_tag_1.default) `
  mutation DeleteStoreCredit($input: ID!) {
    deleteSingleStoreCredit(id: $input) {
      result
      message
    }
  }
`;
