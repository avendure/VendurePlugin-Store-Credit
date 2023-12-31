import { ActiveOrderService, RequestContext } from '@vendure/core';
import { StoreCreditService } from '../service/store-credit.service';
import { ACTIVE_ORDER_INPUT_FIELD_NAME } from '@vendure/core/dist/config/order/active-order-strategy';
import { MutationAddCreditToOrderArgs, QueryStoreCreditsArgs, QueryStoreCreditArgs, MutationClaimArgs, ClaimResult } from 'src/types/credits-shop-types';
type ActiveOrderArgs = {
    [ACTIVE_ORDER_INPUT_FIELD_NAME]?: any;
};
export declare class ShopStoreCreditResolver {
    private storeCreditService;
    private activeOrderService;
    constructor(storeCreditService: StoreCreditService, activeOrderService: ActiveOrderService);
    storeCredit(ctx: RequestContext, args: QueryStoreCreditArgs): Promise<import("../entity/store-credit.entity").StoreCredit | null>;
    storeCredits(ctx: RequestContext, args: QueryStoreCreditsArgs): Promise<{
        items: import("../entity/store-credit.entity").StoreCredit[];
        totalItems: number;
    }>;
    addCreditToOrder(ctx: RequestContext, args: MutationAddCreditToOrderArgs & ActiveOrderArgs): Promise<import("@vendure/core").ErrorResultUnion<import("@vendure/common/lib/generated-shop-types").UpdateOrderItemsResult, import("@vendure/core").Order>>;
    claim(ctx: RequestContext, args: MutationClaimArgs): Promise<ClaimResult>;
    getSellerANDCustomerStoreCredits(ctx: RequestContext): Promise<{
        customerAccountBalance: number;
        sellerAccountBalance: number;
    }>;
}
export {};
