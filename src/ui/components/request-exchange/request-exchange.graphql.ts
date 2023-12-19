import gql from 'graphql-tag';
import { CREDIT_EXCHANGE_FRAGMENT } from '../../common/fragments.graphql';

export const REQUEST_CREDIT_EXCHANGE = gql`
    mutation RequestCreditExchange($amount: Int!) {
        requestCreditExchange(amount: $amount) {
            ...CreditExchange
        }
    }
    ${CREDIT_EXCHANGE_FRAGMENT}
`;
