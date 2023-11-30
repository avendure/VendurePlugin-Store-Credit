import gql from 'graphql-tag';
import { ACCOUNT_BALANCE_FRAGMENT } from '../../common/fragments.graphql';

export const TRANSFER_CREDIT_FROM_SELLER_TO_CUSTOMER = gql`
    mutation transferCreditfromSellerToCustomer($value: Int!, $sellerId: ID!) {
        transferCreditfromSellerToCustomer(value: $value, sellerId: $sellerId) {
            ...AccountBalance
        }
    }
    ${ACCOUNT_BALANCE_FRAGMENT}
`;

export const GET_SELLER_AND_CUSTOMER_STORE_CREDITS = gql`
    query getSellerANDCustomerStoreCredits($sellerId: ID!) {
        getSellerANDCustomerStoreCredits(sellerId: $sellerId) {
            ...AccountBalance
        }
    }
    ${ACCOUNT_BALANCE_FRAGMENT}
`;
