import gql from 'graphql-tag';

import { STORE_CREDIT_FRAGMENT } from '../../common/fragments.graphql';

export const GET_ALL_STORE_CREDITS = gql`
  query GetAllStoreCredits($options: StoreCreditListOptions) {
    storeCredits(options: $options) {
      items {
        ...StoreCredits
      }
      totalItems
    }
  }
  ${STORE_CREDIT_FRAGMENT}
`;

export const GET_STORE_CREDIT = gql`
  query GetStoreCredit($id: ID!) {
    storeCredit(id: $id) {
      ...StoreCredits
    }
  }
  ${STORE_CREDIT_FRAGMENT}
`;

export const DELETE_STORE_CREDIT = gql`
  mutation DeleteStoreCredit($input: ID!) {
    deleteSingleStoreCredit(id: $input) {
      result
      message
    }
  }
`;
