import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import {
    Allow,
    Ctx,
    EntityNotFoundError,
    ID,
    Permission,
    RelationPaths,
    Relations,
    RequestContext,
    Transaction,
} from "@vendure/core";
import {
    MutationRequestCreditExchangeArgs,
    QueryCreditExchangeArgs,
    QueryCreditExchangesArgs,
} from "../types/credits-admin-types";
import { CreditExchangeService } from "../service/credit-exchange.service";
import { CreditExchange } from "../entity/exchange-request.entity";

@Resolver()
export class AdminCreditExchangeResolver {
    constructor(private creditExchangeService: CreditExchangeService) { }

    @Query()
    @Allow(Permission.Authenticated)
    @Allow(Permission.Owner)
    async creditExchange(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryCreditExchangeArgs,
        @Relations({ entity: CreditExchange })
        relations: RelationPaths<CreditExchange>
    ) {
        const exchange = await this.creditExchangeService.findOne(ctx, args.id, relations);
        const isSuperAdmin = ctx.userHasPermissions([Permission.SuperAdmin]);
        if (!isSuperAdmin && exchange?.sellerId != ctx.channel.sellerId) {
            throw new EntityNotFoundError('CreditExchange', args.id);
        }
        return exchange
    }

    @Query()
    @Allow(Permission.Authenticated)
    @Allow(Permission.Owner)
    creditExchanges(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryCreditExchangesArgs
    ) {
        const isSuperAdmin = ctx.userHasPermissions([Permission.SuperAdmin]);
        if (!isSuperAdmin) {
            const sellerId = ctx.channel.sellerId;
            if (!sellerId) {
                throw new Error("Default seller for the channel not found.");
            }
            if (!args.options) args.options = { filter: {} };
            args.options.filter = {
                ...args.options.filter,
                sellerId: { eq: sellerId.toString() },
            };
        }
        return this.creditExchangeService.findAll(ctx, args.options);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.Authenticated)
    requestCreditExchange(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationRequestCreditExchangeArgs
    ) {
        return this.creditExchangeService.requestCreditExchange(ctx, args.amount);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.SuperAdmin)
    async updateCreditExchangeStatus(
        @Ctx() ctx: RequestContext,
        @Args() args: { ids: ID[]; status: string }
    ) {
        return this.creditExchangeService
            .updateStatus(ctx, args.ids, args.status)
            .then((res) => res.affected || args.ids.length);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.SuperAdmin)
    async initiateCreditExchange(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID }
    ) {
        return this.creditExchangeService.initiateCreditExchange(ctx, args.id);
    }
}
