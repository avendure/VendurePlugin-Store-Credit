import { StoreCredit } from "../entity/store-credit.entity";
import { ID, RequestContext } from "@vendure/core";
import { StoreCreditService } from "../service/store-credit.service";
import { MutationCreateStoreCreditArgs, MutationUpdateStoreCreditArgs, QueryStoreCreditsArgs } from "../types/credits-admin-types";
export declare class AdminStoreCreditResolver {
    private storeCreditService;
    constructor(storeCreditService: StoreCreditService);
    createStoreCredit(ctx: RequestContext, args: MutationCreateStoreCreditArgs): Promise<StoreCredit>;
    updateStoreCredit(ctx: RequestContext, args: MutationUpdateStoreCreditArgs): Promise<StoreCredit | null>;
    deleteSingleStoreCredit(ctx: RequestContext, id: string): Promise<{
        message: string;
        result: import("../types/credits-admin-types").DeletionResult;
    }>;
    storeCredits(args: QueryStoreCreditsArgs): Promise<{
        items: StoreCredit[];
        totalItems: number;
    }>;
    transferCreditfromSellerToCustomer(ctx: RequestContext, sellerId: ID, value: Number): Promise<{
        customerAccountBalance: number;
        sellerAccountBalance: number;
    }>;
    getSellerANDCustomerStoreCredits(ctx: RequestContext, sellerId: ID): Promise<{
        customerAccountBalance: any;
        sellerAccountBalance: any;
    }>;
}
