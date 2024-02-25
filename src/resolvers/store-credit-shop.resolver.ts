import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ActiveOrderService, Ctx, Permission, Allow, RequestContext, Transaction } from '@vendure/core';
import { StoreCreditService } from '../service/store-credit.service';
import { ACTIVE_ORDER_INPUT_FIELD_NAME } from '@vendure/core/dist/config/order/active-order-strategy';
import {
    MutationAddCreditToOrderArgs,
    QueryStoreCreditsArgs,
    QueryStoreCreditArgs,
    MutationClaimArgs,
    ClaimResult,
} from '../types/credits-shop-types';

type ActiveOrderArgs = { [ACTIVE_ORDER_INPUT_FIELD_NAME]?: any };

@Resolver()
export class ShopStoreCreditResolver {
    constructor(
        private storeCreditService: StoreCreditService,
        private activeOrderService: ActiveOrderService,
    ) {}

    @Query()
    async storeCredit(@Ctx() ctx: RequestContext, @Args() args: QueryStoreCreditArgs) {
        return this.storeCreditService.findOne(ctx, args.id);
    }

    @Query()
    storeCredits(@Ctx() ctx: RequestContext, @Args() args: QueryStoreCreditsArgs) {
        return this.storeCreditService.findAll(ctx, args.options);
    }

    @Mutation()
    @Transaction()
    async addCreditToOrder(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationAddCreditToOrderArgs & ActiveOrderArgs,
    ) {
        const order = await this.activeOrderService.getActiveOrder(
            ctx,
            args[ACTIVE_ORDER_INPUT_FIELD_NAME],
            true,
        );
        return this.storeCreditService.addToOrder(ctx, args.creditId, args.quantity, order);
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    @Transaction()
    async claim(@Ctx() ctx: RequestContext, @Args() args: MutationClaimArgs): Promise<ClaimResult> {
        return this.storeCreditService.claim(ctx, args.key);
    }

    @Query()
    @Allow(Permission.Authenticated)
    @Transaction()
    async getSellerANDCustomerStoreCredits(@Ctx() ctx: RequestContext) {
        return this.storeCreditService.getSellerANDCustomerStoreCreditsShop(ctx);
    }
}
