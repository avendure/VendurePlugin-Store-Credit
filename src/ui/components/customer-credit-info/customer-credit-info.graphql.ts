import gql from 'graphql-tag';

export const GET_CUSTOMER_CREDITS = gql`
   query GetCustomerCredits($id: ID!) {
         customer(id: $id) {
              id
              storeCredit
         }
   }
`;
