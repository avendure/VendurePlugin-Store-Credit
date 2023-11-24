import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { StoreCredit } from '../entity/store-credit.entity';
import { Allow, Ctx, Permission, RelationPaths, Relations, RequestContext, Transaction } from '@vendure/core';
import { StoreCreditService } from '../service/store-credit.service';
import {
    MutationCreateStoreCreditArgs,
    MutationDeleteSingleStoreCreditArgs,
    MutationTransferCreditfromSellerToCustomerArgs,
    MutationUpdateStoreCreditArgs,
    QueryStoreCreditArgs,
    QueryStoreCreditsArgs,
    QueryGetSellerAndCustomerStoreCreditsArgs,
} from '../types/credits-admin-types';

@Resolver()
export class AdminStoreCreditResolver {
    constructor(private storeCreditService: StoreCreditService) {}

    @Query()
    async storeCredit(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryStoreCreditArgs,
        @Relations({ entity: StoreCredit })
        relations: RelationPaths<StoreCredit>,
    ) {
        return this.storeCreditService.findOne(ctx, args.id, relations);
    }

    @Query()
    storeCredits(@Ctx() ctx: RequestContext, @Args() args: QueryStoreCreditsArgs) {
        return this.storeCreditService.findAll(ctx, args.options);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.SuperAdmin)
    async createStoreCredit(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationCreateStoreCreditArgs,
    ): Promise<StoreCredit> {
        return this.storeCreditService.createStoreCredit(ctx, args.input);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.SuperAdmin)
    async updateStoreCredit(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationUpdateStoreCreditArgs,
    ): Promise<StoreCredit | null> {
        return this.storeCreditService.updateStoreCredit(ctx, args.input);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.SuperAdmin)
    async deleteSingleStoreCredit(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationDeleteSingleStoreCreditArgs,
    ) {
        return this.storeCreditService.deleteOne(ctx, args.id);
    }

    @Mutation()
    @Transaction()
    transferCreditfromSellerToCustomer(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationTransferCreditfromSellerToCustomerArgs,
    ) {
        return this.storeCreditService.transferCreditfromSellerToCustomerWithSameEmail(
            ctx,
            args.value,
            args.sellerId,
        );
    }

    @Query()
    getSellerANDCustomerStoreCredits(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryGetSellerAndCustomerStoreCreditsArgs,
    ) {
        return this.storeCreditService.getSellerANDCustomerStoreCredits(ctx, args.sellerId);
    }
}
