import gql from 'graphql-tag';
import { CREDIT_EXCHANGE_FRAGMENT } from '../../common/fragments.graphql';

export const GET_ALL_CREDIT_EXCHANGE = gql`
    query GetAllCreditExchange($options: CreditExchangeListOptions) {
        creditExchanges(options: $options) {
            items {
                ...CreditExchange
            }
            totalItems
        }
    }
    ${CREDIT_EXCHANGE_FRAGMENT}
`;

export const UPDATE_CREDIT_EXCHANGE_STATUS = gql`
    mutation UpdateCreditExchangeStatus($ids: [ID!]!, $status: String!) {
        updateCreditExchangeStatus(ids: $ids, status: $status)
    }
`;

export const ACCEPT_CREDIT_EXCHANGE = gql`
    mutation AcceptCreditExchange($id: ID!) {
        initiateCreditExchange(id: $id) {
            id
            code
        }
    }
`;

export const REFUND_CREDIT_EXCHANGE = gql`
    mutation RefundCreditExchange($id: ID!) {
        refundCreditExchange(id: $id) {
            ...CreditExchange
        }
    }
    ${CREDIT_EXCHANGE_FRAGMENT}
`;
