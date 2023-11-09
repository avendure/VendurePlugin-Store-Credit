import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { StoreCredit } from '../entity/store-credit.entity';
import {
  Allow,
  Ctx,
  ID,
  Permission,
  RequestContext,
  Transaction,
} from '@vendure/core';
import { StoreCreditService } from '../service/store-credit.service';
import {
  MutationCreateStoreCreditArgs,
  MutationUpdateStoreCreditArgs,
  QueryStoreCreditArgs,
  QueryStoreCreditsArgs,
} from '../types/credits-admin-types';

@Resolver()
export class AdminStoreCreditResolver {
  constructor(private storeCreditService: StoreCreditService) {}

  @Transaction()
  @Mutation()
  @Allow(Permission.SuperAdmin)
  async createStoreCredit(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationCreateStoreCreditArgs,
  ): Promise<StoreCredit> {
    const { input } = args;
    return this.storeCreditService.createStoreCredit(ctx, input);
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.SuperAdmin)
  async updateStoreCredit(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationUpdateStoreCreditArgs,
  ): Promise<StoreCredit | null> {
    const { input } = args;
    return this.storeCreditService.updateStoreCredit(ctx, input);
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.SuperAdmin)
  async deleteSingleStoreCredit(
    @Ctx() ctx: RequestContext,
    @Args('id') id: string,
  ) {
    return this.storeCreditService.deleteStoreCredit(ctx, id);
  }

  @Query()
  @Allow(Permission.SuperAdmin)
  storeCredits(@Args() args: QueryStoreCreditsArgs) {
    const { options } = args;
    return this.storeCreditService.getAllStoreCredit(options);
  }

  @Query()
  transferCreditfromSellerToCustomer(
    @Ctx() ctx: RequestContext,
    @Args('sellerId') sellerId: ID,
    @Args('value') value: Number,
  ) {
    return this.storeCreditService.transferCreditfromSellerToCustomerWithSameEmail(
      ctx,
      value,
      sellerId,
    );
  }

  @Query()
  getSellerANDCustomerStoreCredits(
    @Ctx() ctx: RequestContext,
    @Args('sellerId') sellerId: ID,
  ) {
    return this.storeCreditService.getSellerANDCustomerStoreCredits(
      ctx,
      sellerId,
    );
  }
}
