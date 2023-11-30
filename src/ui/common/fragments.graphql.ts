import gql from 'graphql-tag';

export const STORE_CREDIT_FRAGMENT = gql`
    fragment StoreCredits on StoreCredit {
        id
        value
        perUserLimit
        key
        createdAt
        updatedAt
        customer {
            id
            createdAt
            updatedAt
        }
        customerId
        variant {
            id
            createdAt
            updatedAt
            name
            price
            productId
            featuredAsset {
                id
                preview
                focalPoint {
                    x
                    y
                }
            }
        }
        variantId
    }
`;

export const ACCOUNT_BALANCE_FRAGMENT = gql`
    fragment AccountBalance on AccountBalance {
        customerAccountBalance
        sellerAccountBalance
    }
`;
