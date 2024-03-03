import { StoreCredit } from '../entity/store-credit.entity';
import { Customer, CustomerService, RelationPaths, RequestContext, Seller } from '@vendure/core';
import { StoreCreditService } from '../service/store-credit.service';
import { MutationCreateStoreCreditArgs, MutationDeleteSingleStoreCreditArgs, MutationUpdateStoreCreditArgs, QueryStoreCreditArgs, QueryStoreCreditsArgs } from '../types/credits-admin-types';
export declare class AdminStoreCreditResolver {
    private storeCreditService;
    constructor(storeCreditService: StoreCreditService);
    storeCredit(ctx: RequestContext, args: QueryStoreCreditArgs, relations: RelationPaths<StoreCredit>): Promise<StoreCredit | null>;
    storeCredits(ctx: RequestContext, args: QueryStoreCreditsArgs): Promise<{
        items: StoreCredit[];
        totalItems: number;
    }>;
    createStoreCredit(ctx: RequestContext, args: MutationCreateStoreCreditArgs): Promise<StoreCredit>;
    updateStoreCredit(ctx: RequestContext, args: MutationUpdateStoreCreditArgs): Promise<StoreCredit | null>;
    deleteSingleStoreCredit(ctx: RequestContext, args: MutationDeleteSingleStoreCreditArgs): Promise<{
        result: import("../types/credits-admin-types").DeletionResult;
        message: string;
    }>;
}
export declare class SellerEntityAdminResolver {
    private storeCreditService;
    constructor(storeCreditService: StoreCreditService);
    storeCredit(ctx: RequestContext, seller: Seller): Promise<number>;
}
export declare class CustomerEntityAdminResolver {
    private customerService;
    constructor(customerService: CustomerService);
    storeCredit(ctx: RequestContext, customer: Customer): Promise<number>;
}
