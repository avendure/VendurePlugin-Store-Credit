import { StoreCreditService } from '../service/store-credit.service';
import { RequestContext } from '@vendure/core';
import { QueryStoreCreditArgs } from '../types/credits-admin-types';
export declare class StoreCreditCommResolver {
    private storeCreditService;
    constructor(storeCreditService: StoreCreditService);
    storeCredit(ctx: RequestContext, args: QueryStoreCreditArgs): Promise<import("../entity/store-credit.entity").StoreCredit | null>;
    customerStoreCredits(ctx: RequestContext): Promise<import("../entity/store-credit.entity").StoreCredit[]>;
    customerStoreCredit(ctx: RequestContext, input: {
        id: string;
        customerId: string;
    }): Promise<import("../entity/store-credit.entity").StoreCredit>;
}
