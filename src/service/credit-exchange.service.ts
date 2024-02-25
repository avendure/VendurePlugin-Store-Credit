import { Injectable, Inject } from '@nestjs/common';
import {
    TransactionalConnection,
    RequestContext,
    ListQueryBuilder,
    ID,
    RelationPaths,
    EntityHydrator,
    Seller,
    ChannelService,
    OrderService,
    ProductVariant,
    isGraphQlErrorResult,
    SellerService,
} from '@vendure/core';
import { CreditExchange } from '../entity/exchange-request.entity';
import { CreditExchangeListOptions } from '../types/credits-admin-types';
import { StoreCreditPluginOptions } from '../types/options';
import { STORE_CREDIT_PLUGIN_OPTIONS } from '../constants';
import { In } from 'typeorm';
import { NPPService } from './npp.service';

@Injectable()
export class CreditExchangeService {
    constructor(
        private listQueryBuilder: ListQueryBuilder,
        private connection: TransactionalConnection,
        private entityHydrator: EntityHydrator,
        @Inject(STORE_CREDIT_PLUGIN_OPTIONS)
        private options: StoreCreditPluginOptions,
        private channelService: ChannelService,
        private orderService: OrderService,
        private nppService: NPPService,
        private sellerService: SellerService,
    ) {}

    async findAll(
        ctx: RequestContext,
        options?: CreditExchangeListOptions,
        relations?: RelationPaths<CreditExchange>,
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

    async findOne(ctx: RequestContext, id: ID, relations?: RelationPaths<CreditExchange>) {
        return this.connection.getRepository(ctx, CreditExchange).findOne({
            where: {
                id,
            },
            relations,
        });
    }

    async requestCreditExchange(ctx: RequestContext, amount: number) {
        if (amount > this.options.exchange.maxAmount) {
            throw new Error(
                `Request amount exceed the max amount which is ${this.options.exchange.maxAmount}`,
            );
        }

        await this.entityHydrator.hydrate(ctx, ctx.channel, {
            relations: ['seller'],
        });
        const seller = ctx.channel.seller;
        if (!seller) {
            throw new Error('Seller not found');
        }

        if (seller?.customFields.accountBalance < amount) {
            throw new Error('Insufficient Balance');
        }

        await this.connection.getRepository(ctx, Seller).update(
            { id: seller.id },
            {
                customFields: {
                    accountBalance: seller.customFields.accountBalance - amount,
                },
            },
        );

        const exchangeFee =
            this.options.exchange.fee.type == 'fixed'
                ? this.options.exchange.fee.value
                : (this.options.exchange.fee.value * amount) / 100;
        const creditExchange = new CreditExchange({
            seller,
            sellerId: seller.id,
            amount: amount - exchangeFee,
            status: 'Pending',
        });

        return this.connection.getRepository(ctx, CreditExchange).save(creditExchange);
    }

    async updateStatus(ctx: RequestContext, ids: ID[], status: string) {
        return this.connection.getRepository(ctx, CreditExchange).update({ id: In(ids) }, { status });
    }

    async initiateCreditExchange(ctx: RequestContext, id: ID) {
        const exchange = await this.connection.getEntityOrThrow(ctx, CreditExchange, id);
        if (exchange.orderId) {
            throw new Error('Order already created for this exchange');
        }
        if (exchange.status != 'Pending') {
            throw new Error('Exchange not in pending state');
        }

        const defaultChannel = await this.channelService.getDefaultChannel(ctx);
        const superAdminSeller = await this.connection.getRepository(ctx, Seller).findOne({
            where: { id: defaultChannel.sellerId },
        });

        const order = await this.orderService.create(ctx, ''); // need to work here

        const nppId = await this.nppService.getRootNPPId(ctx);

        const payoutCode = this.options.exchange.payoutOption.code;
        const payoutVariant = await this.connection
            .getRepository(ctx, ProductVariant)
            .findOne({ where: { productId: nppId, options: { code: payoutCode } } });
        if (!payoutVariant)
            throw new Error(
                `Payout variant not found. Create a variant with "${payoutCode} productOption under NPP.`,
            );

        const conversionFactor =
            this.options.creditToCurrencyFactor[payoutVariant.currencyCode] ||
            this.options.creditToCurrencyFactor['default'];
        const exchangeAmount = Math.floor(exchange.amount / conversionFactor);

        const addPaymentResult = await this.orderService.addItemToOrder(
            ctx,
            order.id,
            payoutVariant.id,
            exchangeAmount,
        );

        if (isGraphQlErrorResult(addPaymentResult)) throw addPaymentResult;

        exchange.orderId = addPaymentResult.id;
        exchange.order = addPaymentResult;
        exchange.status = 'Processing';
        await this.connection.getRepository(ctx, CreditExchange).save(exchange);

        return addPaymentResult;
    }

    async refund(ctx: RequestContext, id: ID) {
        const exchange = await this.connection.getEntityOrThrow(ctx, CreditExchange, id, {
            relations: { seller: true },
        });
        if (exchange.status != 'Pending') {
            throw new Error('Exchange not in pending state');
        }
        const requestedAmount =
            this.options.exchange.fee.type == 'fixed'
                ? this.options.exchange.fee.value + exchange.amount
                : (100 * exchange.amount) / (100 - this.options.exchange.fee.value);
        await this.sellerService.update(ctx, {
            id: exchange.sellerId,
            customFields: {
                accountBalance: exchange.seller.customFields.accountBalance + requestedAmount,
            },
        });

        exchange.status = 'Refunded';
        return this.connection.getRepository(ctx, CreditExchange).save(exchange);
    }
}
