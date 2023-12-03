import { VendureEntity, ID, ProductVariant, DeepPartial, Customer } from '@vendure/core';
export declare class StoreCredit extends VendureEntity {
    constructor(input?: DeepPartial<StoreCredit>);
    variant: ProductVariant | null;
    variantId: ID | null;
    perUserLimit: number;
    value: number;
    key: string;
    customer: Customer | null;
    customerId: ID | null;
}
