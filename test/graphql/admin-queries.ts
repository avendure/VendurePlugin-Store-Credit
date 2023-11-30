import gql from "graphql-tag";

export const GET_CUSTOMER_LIST = gql`
	query GetCustomerList($options: CustomerListOptions) {
		customers(options: $options) {
			items {
				id
				title
				firstName
				lastName
				emailAddress
				phoneNumber
				user {
					id
					identifier
				}
			}
			totalItems
		}
	}
`;

export const SET_SELLER_USER = gql`
	mutation SetSellerUser($input: UpdateSellerInput!) {
		updateSeller(input: $input) {
			customFields {
				user {
					id
					identifier
				}
			}
		}
	}
`;

export const CREATE_STORE_CREDIT = gql`
	mutation createStoreCredit($input: StoreCreditAddInput!) {
		createStoreCredit(input: $input) {
			key
			value
			perUserLimit
			customerId
		}
	}
`;

export const TRANSFER_FROM_SELLER_TO_CUSTOMER = gql`
	mutation TransferFromSellerToCustomer($value: Int!, $sellerId: ID!) {
		transferCreditfromSellerToCustomer(value: $value, sellerId: $sellerId) {
			customerAccountBalance
			sellerAccountBalance
		}
	}
`;

export const CREATE_SELLER = gql`
	mutation CreateSeller($input: CreateSellerInput!) {
		createSeller(input: $input) {
			id
			customFields {
				user {
					id
					identifier
				}
			}
		}
	}
`;

export const CREATE_CHANNEL = gql`
	mutation CreateChannel($input: CreateChannelInput!) {
		createChannel(input: $input) {
			__typename
			... on Channel {
				id
				code
			}
		}
	}
`;

export const ASSIGN_PRODUCT_VARIANT_TO_CHANNEL = gql`
	mutation AssignProductVariantsToChannel($input: AssignProductVariantsToChannelInput!) {
		assignProductVariantsToChannel(input: $input) {
			id
            channels {
                id
            }
		}
	}
`;

export const GET_SELLER = gql`
	query GetSeller($id: ID!) {
		seller(id: $id) {
			id
			customFields {
				accountBalance
			}
		}
	}
`;
