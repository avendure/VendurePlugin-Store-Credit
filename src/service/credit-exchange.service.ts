import { Injectable, Inject } from "@nestjs/common";
import {
	TransactionalConnection,
	RequestContext,
	ListQueryBuilder,
	ID,
	RelationPaths,
	EntityHydrator,
	Seller,
} from "@vendure/core";
import { CreditExchange } from "../entity/exchange-request.entity";
import { CreditExchangeListOptions } from "src/types/credits-admin-types";
import { StoreCreditPluginOptions } from "../types/options";
import { STORE_CREDIT_PLUGIN_OPTIONS } from "../constants";

@Injectable()
export class CreditExchangeService {
	constructor(
		private listQueryBuilder: ListQueryBuilder,
		private connection: TransactionalConnection,
		private entityHydrator: EntityHydrator,
		@Inject(STORE_CREDIT_PLUGIN_OPTIONS)
		private options: StoreCreditPluginOptions
	) {}

	async findAll(
		ctx: RequestContext,
		options?: CreditExchangeListOptions,
		relations?: RelationPaths<CreditExchange>
	) {
		return this.listQueryBuilder
			.build(CreditExchange, options, {
				ctx,
				relations,
			})
			.getManyAndCount()
			.then(([exchanges, totalItems]) => {
				return {
					items: exchanges,
					totalItems,
				};
			});
	}

	async findOne(
		ctx: RequestContext,
		id: ID,
		relations?: RelationPaths<CreditExchange>
	) {
		return this.connection.getRepository(ctx, CreditExchange).findOne({
			where: {
				id,
			},
			relations,
		});
	}

	async requestCreditExchange(ctx: RequestContext, amount: number) {
		await this.entityHydrator.hydrate(ctx, ctx.channel, {
			relations: ["seller"],
		});
		const seller = ctx.channel.seller;
		if (!seller) {
			throw new Error("Seller not found");
		}

		if (seller?.customFields.accountBalance < amount) {
			throw new Error("Insufficient Balance");
		}

		await this.connection.getRepository(ctx, Seller).update(
			{ id: seller.id },
			{
				customFields: {
					accountBalance: seller.customFields.accountBalance - amount,
				},
			}
		);

		const exchangeFee =
			this.options.exchangeFee.type == "fixed"
				? this.options.exchangeFee.value
				: (this.options.exchangeFee.value * amount) / 100;
		const creditExchange = new CreditExchange({
			seller,
			sellerId: seller.id,
			amount: amount - exchangeFee,
			status: "Pending",
		});

		return this.connection
			.getRepository(ctx, CreditExchange)
			.save(creditExchange);
	}
}
