import gql from 'graphql-tag';

export const GET_CUSTOMER_LIST = gql`
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

export const ASSIGN_SHIPPINGMETHOD_TO_CHANNEL = gql`
    mutation assignShippingMethodToChannel($input: AssignShippingMethodsToChannelInput!) {
        assignShippingMethodsToChannel(input: $input) {
            __typename
            id
            code
            name
            fulfillmentHandlerCode
            checker {
                code
            }
            calculator {
                code
            }
        }
    }
`;

export const SET_SELLER_USER = gql`
    mutation SetSellerUser($input: UpdateSellerInput!) {
        updateSeller(input: $input) {
            customFields {
                customer {
                    id
                    emailAddress
                }
            }
        }
    }
`;

export const CREATE_STORE_CREDIT = gql`
    mutation createStoreCredit($input: StoreCreditAddInput!) {
        createStoreCredit(input: $input) {
            key
            value
            perUserLimit
            customerId
        }
    }
`;

export const TRANSFER_FROM_SELLER_TO_CUSTOMER = gql`
    mutation TransferFromSellerToCustomer($value: Int!, $sellerId: ID!) {
        transferCreditfromSellerToCustomer(value: $value, sellerId: $sellerId) {
            customerAccountBalance
            sellerAccountBalance
        }
    }
`;

export const CREATE_SELLER = gql`
    mutation CreateSeller($input: CreateSellerInput!) {
        createSeller(input: $input) {
            id
            customFields {
                customer {
                    id
                    emailAddress
                }
            }
        }
    }
`;

export const GET_CHANNELS = gql`
    query GetChannels {
        channels {
            items {
                id
                code
                token
            }
        }
    }
`;

export const CREATE_CHANNEL = gql`
    mutation CreateChannel($input: CreateChannelInput!) {
        createChannel(input: $input) {
            __typename
            ... on Channel {
                id
                code
                token
            }
        }
    }
`;

export const ASSIGN_PRODUCT_VARIANT_TO_CHANNEL = gql`
    mutation AssignProductVariantsToChannel($input: AssignProductVariantsToChannelInput!) {
        assignProductVariantsToChannel(input: $input) {
            id
            channels {
                id
            }
        }
    }
`;

export const GET_SELLER = gql`
    query GetSeller($id: ID!) {
        seller(id: $id) {
            id
            customFields {
                accountBalance
            }
        }
    }
`;

export const UPDATE_SELLER = gql`
    mutation UpdateSeller($input: UpdateSellerInput!) {
        updateSeller(input: $input) {
            id
            customFields {
                customer {
                    id
                }
            }
        }
    }
`;

export const REQUEST_CREDIT_EXCHANGE = gql`
    mutation RequestCreditExchange($amount: Int!) {
        requestCreditExchange(amount: $amount) {
            id
            status
            amount
        }
    }
`;

export const REFUND_CREDIT_EXCHANGE = gql`
    mutation RefundCreditExchange($id: ID!) {
        refundCreditExchange(id: $id) {
            id
            status
        }
    }
`;

export const ACCEPT_CREDIT_EXCHANGE = gql`
    mutation AcceptCreditExchange($id: ID!) {
        initiateCreditExchange(id: $id) {
            id
            code
            lines {
                productVariant {
                    options {
                        code
                    }
                }
            }
        }
    }
`;

export const UPDATE_CREDIT_EXCHANGE_STATUS = gql`
    mutation UpdateCreditExchangeStatus($ids: [ID!]!, $status: String!) {
        updateCreditExchangeStatus(ids: $ids, status: $status)
    }
`;

export const GET_PRODUCTS = gql`
    query GetProducts($options: ProductListOptions) {
        products(options: $options) {
            items {
                id
                slug
                optionGroups {
                    id
                    options {
                        id
                        code
                    }
                }
            }
        }
    }
`;

export const CREATE_PRODUCT_VARIANT = gql`
    mutation CreateProductVariant($input: [CreateProductVariantInput!]!) {
        createProductVariants(input: $input) {
            id
        }
    }
`;
