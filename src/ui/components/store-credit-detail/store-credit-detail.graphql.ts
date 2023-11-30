import gql from "graphql-tag";

import { STORE_CREDIT_FRAGMENT } from "../../common/fragments.graphql";

export const UPDATE_STORE_CREDIT = gql`
  mutation UpdateStoreCredit($input: StoreCreditUpdateInput!) {
    updateStoreCredit(input: $input) {
      ...StoreCredits
    }
  }
  ${STORE_CREDIT_FRAGMENT}
`;

export const CREATE_STORE_CREDIT = gql`
  mutation CreateStoreCredit($input: StoreCreditAddInput!) {
    createStoreCredit(input: $input) {
      ...StoreCredits
    }
  }
  ${STORE_CREDIT_FRAGMENT}
`;
