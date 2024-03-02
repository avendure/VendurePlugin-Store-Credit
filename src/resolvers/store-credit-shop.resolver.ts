import { Resolver, Query, Mutation, Args, Parent, ResolveField } from '@nestjs/graphql';
import { ActiveOrderService, Ctx, Permission, Allow, RequestContext, Transaction, CustomerService, Customer, Seller, ErrorResultUnion, Order, OrderService } from '@vendure/core';
import { StoreCreditService } from '../service/store-credit.service';
import { ACTIVE_ORDER_INPUT_FIELD_NAME } from '@vendure/core/dist/config/order/active-order-strategy';
import {
    MutationAddCreditToOrderArgs,
    QueryStoreCreditsArgs,
    QueryStoreCreditArgs,
    MutationClaimArgs,
    ClaimResult,
    MutationAddItemToOrderArgs,
    UpdateOrderItemsResult,
} from '../types/credits-shop-types';

type ActiveOrderArgs = { [ACTIVE_ORDER_INPUT_FIELD_NAME]?: any };

@Resolver()
export class ShopStoreCreditResolver {
    constructor(
        private storeCreditService: StoreCreditService,
        private activeOrderService: ActiveOrderService,
        private orderService: OrderService,
    ) { }

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

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateOrder, Permission.Owner)
    async addItemToOrder(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationAddItemToOrderArgs & ActiveOrderArgs,
    ) {
        await this.storeCreditService.testIfSameSellerAndCustomer(ctx, args.productVariantId);
        const order = await this.activeOrderService.getActiveOrder(
            ctx,
            args[ACTIVE_ORDER_INPUT_FIELD_NAME],
            true,
        );
        return this.orderService.addItemToOrder(
            ctx,
            order.id,
            args.productVariantId,
            args.quantity,
            (args as any).customFields,
        );
    }

}

@Resolver('Seller')
export class SellerEntityShopResolver {
    constructor(private storeCreditService: StoreCreditService) { }

    @ResolveField()
    async storeCredit(@Ctx() ctx: RequestContext, @Parent() seller: Seller) {
        const theUser = await this.storeCreditService.getSellerUser(ctx, seller.id);
        return theUser.customFields?.accountBalance;
    }
}

@Resolver('Customer')
export class CustomerEntityShopResolver {
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
        return theUser.customFields?.accountBalance;
    }
}
