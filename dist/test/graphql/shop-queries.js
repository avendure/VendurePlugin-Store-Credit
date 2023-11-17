"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADD_PAYMENT_TO_ORDER = exports.TRANSITION_ORDER_TO_STATE = exports.SET_SHIPPING_METHOD = exports.SET_BILLING_ADDRESS = exports.SET_SHIPPING_ADDRESS = exports.ADD_PRODUCT_TO_ORDER = exports.CLAIM_CREDIT = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.CLAIM_CREDIT = (0, graphql_tag_1.default) `
  mutation ClaimCredit($key: String!) {
    claim(key: $key) {
      key
      value
      isClaimed
    }
  }
`;
const ORDER_FRAGMENT = (0, graphql_tag_1.default) `
  fragment OrderFields on Order {
    id
    code
    state
    active
    total
    totalWithTax
    shippingWithTax
    customer {
      emailAddress
    }
    shippingAddress {
      fullName
    }
    lines {
      id
      quantity
      productVariant {
        id
      }
      discounts {
        adjustmentSource
        amount
        amountWithTax
        description
        type
      }
    }
  }
`;
exports.ADD_PRODUCT_TO_ORDER = (0, graphql_tag_1.default) `
  mutation AddProductToOrder($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      __typename
      ... on Order {
        ...OrderFields
      }
    }
  }
  ${ORDER_FRAGMENT}
`;
exports.SET_SHIPPING_ADDRESS = (0, graphql_tag_1.default) `
  mutation SetShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      __typename
      ... on Order {
        ...OrderFields
      }
    }
  }
  ${ORDER_FRAGMENT}
`;
exports.SET_BILLING_ADDRESS = (0, graphql_tag_1.default) `
  mutation SetBillingAddress($input: CreateAddressInput!) {
    setOrderBillingAddress(input: $input) {
      __typename
      ... on Order {
        ...OrderFields
      }
    }
  }
  ${ORDER_FRAGMENT}
`;
exports.SET_SHIPPING_METHOD = (0, graphql_tag_1.default) `
  mutation SetShippingMethod($ids: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $ids) {
      __typename
      ... on Order {
        ...OrderFields
      }
    }
  }
  ${ORDER_FRAGMENT}
`;
exports.TRANSITION_ORDER_TO_STATE = (0, graphql_tag_1.default) `
  mutation TransitionToState($state: String!) {
    transitionOrderToState(state: $state) {
      __typename
    }
  }
`;
exports.ADD_PAYMENT_TO_ORDER = (0, graphql_tag_1.default) `
  mutation AddPaymentToOrder($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      __typename
      ... on Order {
        ...OrderFields
      }
      ... on PaymentDeclinedError {
        errorCode
        message
        paymentErrorMessage
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${ORDER_FRAGMENT}
`;
