import { StoreCredit } from '../entity/store-credit.entity';
import { RequestContext } from '@vendure/core';
import { StoreCreditService } from '../service/store-credit.service';
import { MutationClaimArgs } from '../types/credits-shop-types';
export declare class ShopStoreCreditResolver {
    private storeCreditService;
    constructor(storeCreditService: StoreCreditService);
    claim(ctx: RequestContext, args: MutationClaimArgs): Promise<StoreCredit | null>;
}
