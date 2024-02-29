import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { StoreCredit } from '../entity/store-credit.entity';
import { Allow, Ctx, Customer, CustomerService, Permission, RelationPaths, Relations, RequestContext, Seller, Transaction } from '@vendure/core';
import { StoreCreditService } from '../service/store-credit.service';
import {
    MutationCreateStoreCreditArgs,
    MutationDeleteSingleStoreCreditArgs,
    MutationUpdateStoreCreditArgs,
    QueryStoreCreditArgs,
    QueryStoreCreditsArgs
} from '../types/credits-admin-types';

@Resolver()
export class AdminStoreCreditResolver {
    constructor(private storeCreditService: StoreCreditService) { }

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

}

@Resolver('Seller')
export class SellerEntityAdminResolver {
    constructor(private storeCreditService: StoreCreditService) { }

    @ResolveField()
    async storeCredit(@Ctx() ctx: RequestContext, @Parent() seller: Seller) {
        const theUser = await this.storeCreditService.getSellerUser(ctx, seller.id);
        return theUser.customFields?.sellerAccountBalance;
    }
}

@Resolver('Customer')
export class CustomerEntityAdminResolver {
    constructor(private customerService: CustomerService) { }

    @ResolveField()
    async storeCredit(@Ctx() ctx: RequestContext, @Parent() customer: Customer) {
        const theCustomer = await this.customerService.findOne(ctx, customer.id, ['user']);
        if (!theCustomer) {
            throw new Error('Customer not found');
        }
        const theUser = theCustomer.user;
        if (!theUser) {
            throw new Error('Customer user not found');
        }
        return theUser.customFields?.customerAccountBalance;
    }
}
