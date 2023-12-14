import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import {
	Allow,
	Ctx,
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
	constructor(private creditExchangeService: CreditExchangeService) {}

	@Query()
	@Allow(Permission.SuperAdmin)
	async creditExchange(
		@Ctx() ctx: RequestContext,
		@Args() args: QueryCreditExchangeArgs,
		@Relations({ entity: CreditExchange })
		relations: RelationPaths<CreditExchange>
	) {
		return this.creditExchangeService.findOne(ctx, args.id, relations);
	}

	@Query()
	@Allow(Permission.SuperAdmin)
	creditExchanges(
		@Ctx() ctx: RequestContext,
		@Args() args: QueryCreditExchangesArgs
	) {
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
}
