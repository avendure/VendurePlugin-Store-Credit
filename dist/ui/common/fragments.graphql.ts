import gql from 'graphql-tag';

export const STORE_CREDIT_FRAGMENT = gql`
  fragment StoreCredits on StoreCredit {
    id
    key
    value
    customerId
    isClaimed
    createdAt
    updatedAt
  }
`;
