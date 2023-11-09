import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { StoreCredit } from '../entity/store-credit.entity';
import { Allow, Ctx, Permission, RequestContext } from '@vendure/core';
import { StoreCreditService } from '../service/store-credit.service';
import { MutationClaimArgs } from '../types/credits-shop-types';

@Resolver()
export class ShopStoreCreditResolver {
  constructor(private storeCreditService: StoreCreditService) {}

  @Mutation()
  @Allow(Permission.Authenticated)
  claim(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationClaimArgs,
  ): Promise<StoreCredit | null> {
    return this.storeCreditService.claim(ctx, args.key);
  }
}
