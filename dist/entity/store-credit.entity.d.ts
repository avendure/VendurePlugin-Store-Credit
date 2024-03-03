import { VendureEntity, ID, ProductVariant, DeepPartial, User } from '@vendure/core';
export declare class StoreCredit extends VendureEntity {
    constructor(input?: DeepPartial<StoreCredit>);
    variant: ProductVariant | null;
    variantId: ID | null;
    perUserLimit: number;
    value: number;
    key: string;
    user: User | null;
    userId: ID | null;
}
