import gql from 'graphql-tag';

export const GET_BALANCE = gql`
    query GetBalance {
        getSellerANDCustomerStoreCredits {
            customerAccountBalance
            sellerAccountBalance
        }
    }
`;

export const CLAIM_CREDIT = gql`
    mutation ClaimCredit($key: String!) {
        claim(key: $key) {
            success
            message
            addedCredit
            currentBalance
        }
    }
`;

const ORDER_FRAGMENT = gql`
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
                name
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

export const ADD_PRODUCT_TO_ORDER = gql`
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

export const SET_SHIPPING_ADDRESS = gql`
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

export const SET_BILLING_ADDRESS = gql`
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

export const SET_SHIPPING_METHOD = gql`
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

export const TRANSITION_ORDER_TO_STATE = gql`
    mutation TransitionToState($state: String!) {
        transitionOrderToState(state: $state) {
            __typename
        }
    }
`;

export const ADD_PAYMENT_TO_ORDER = gql`
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
