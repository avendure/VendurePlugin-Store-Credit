"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCOUNT_BALANCE_FRAGMENT = exports.STORE_CREDIT_FRAGMENT = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.STORE_CREDIT_FRAGMENT = (0, graphql_tag_1.default) `
  fragment StoreCredit on StoreCredit {
    id
    key
    value
    customerId
    isClaimed
    createdAt
    updatedAt
  }
`;
exports.ACCOUNT_BALANCE_FRAGMENT = (0, graphql_tag_1.default) `
  fragment AccountBalance on AccountBalance {
    customerAccountBalance
    sellerAccountBalance
  }
`;
