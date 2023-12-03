import { StoreCredit } from '../entity/store-credit.entity';
import { RelationPaths, RequestContext } from '@vendure/core';
import { StoreCreditService } from '../service/store-credit.service';
import { MutationCreateStoreCreditArgs, MutationDeleteSingleStoreCreditArgs, MutationTransferCreditfromSellerToCustomerArgs, MutationUpdateStoreCreditArgs, QueryStoreCreditArgs, QueryStoreCreditsArgs, QueryGetSellerAndCustomerStoreCreditsArgs } from '../types/credits-admin-types';
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
    transferCreditfromSellerToCustomer(ctx: RequestContext, args: MutationTransferCreditfromSellerToCustomerArgs): Promise<{
        customerAccountBalance: number;
        sellerAccountBalance: number;
    }>;
    getSellerANDCustomerStoreCredits(ctx: RequestContext, args: QueryGetSellerAndCustomerStoreCreditsArgs): Promise<{
        customerAccountBalance: number;
        sellerAccountBalance: number;
    }>;
}
