import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { StoreCreditService } from '../service/store-credit.service';
import { Allow, Ctx, Permission, RequestContext } from '@vendure/core';
import { QueryStoreCreditArgs } from '../types/credits-admin-types';

@Resolver()
export class StoreCreditCommResolver {
  constructor(private storeCreditService: StoreCreditService) {}

  @Query()
  // @Allow(Permission.SuperAdmin, Permission.Owner)
  async storeCredit(
    @Ctx() ctx: RequestContext,
    @Args() args: QueryStoreCreditArgs,
  ) {
    const { id } = args;
    return this.storeCreditService.getStoreCreditById(ctx, id);
  }

  @Query()
  @Allow(Permission.SuperAdmin, Permission.Owner)
  async customerStoreCredits(@Ctx() ctx: RequestContext) {
    return this.storeCreditService.getCustomerStoreCredits(ctx);
  }

  @Query()
  @Allow(Permission.SuperAdmin, Permission.Owner)
  async customerStoreCredit(
    @Ctx() ctx: RequestContext,
    @Args() input: { id: string; customerId: string },
  ) {
    return this.storeCreditService.getStoreCreditByCustomerId(ctx, input);
  }
}
