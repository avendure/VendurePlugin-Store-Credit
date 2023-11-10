"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREATE_STORE_CREDIT = exports.UPDATE_STORE_CREDIT = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const fragments_graphql_1 = require("../../common/fragments.graphql");
exports.UPDATE_STORE_CREDIT = (0, graphql_tag_1.default) `
  mutation UpdateStoreCredit($input: StoreCreditUpdateInput!) {
    updateStoreCredit(input: $input) {
      ...StoreCredits
    }
  }
  ${fragments_graphql_1.STORE_CREDIT_FRAGMENT}
`;
exports.CREATE_STORE_CREDIT = (0, graphql_tag_1.default) `
  mutation CreateStoreCredit($input: StoreCreditAddInput!) {
    createStoreCredit(input: $input) {
      ...StoreCredits
    }
  }
  ${fragments_graphql_1.STORE_CREDIT_FRAGMENT}
`;
