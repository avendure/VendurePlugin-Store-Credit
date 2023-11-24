import gql from 'graphql-tag';

export const STORE_CREDIT_FRAGMENT = gql`
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

export const ACCOUNT_BALANCE_FRAGMENT = gql`
  fragment AccountBalance on AccountBalance {
    customerAccountBalance
    sellerAccountBalance
  }
`;
