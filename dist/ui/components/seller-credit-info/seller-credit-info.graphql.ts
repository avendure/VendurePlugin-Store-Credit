import gql from 'graphql-tag';

export const GET_SELLER_CREDITS = gql`
   query GetSellerCredits($id: ID!) {
         seller(id: $id) {
              id
              storeCredit
         }
   }
`;
