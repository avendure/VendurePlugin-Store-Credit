import { VendureEntity, DeepPartial } from '@vendure/core';
export declare class StoreCredit extends VendureEntity {
    constructor(input?: DeepPartial<StoreCredit>);
    key: string;
    value: number;
    customerId: string;
    isClaimed: boolean;
}
