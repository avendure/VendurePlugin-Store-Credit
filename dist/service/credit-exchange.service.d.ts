import { TransactionalConnection, RequestContext, ListQueryBuilder, ID, RelationPaths, EntityHydrator, ChannelService, OrderService, SellerService } from '@vendure/core';
import { CreditExchange } from '../entity/exchange-request.entity';
import { CreditExchangeListOptions } from 'src/types/credits-admin-types';
import { StoreCreditPluginOptions } from '../types/options';
import { NPPService } from './npp.service';
export declare class CreditExchangeService {
    private listQueryBuilder;
    private connection;
    private entityHydrator;
    private options;
    private channelService;
    private orderService;
    private nppService;
    private sellerService;
    constructor(listQueryBuilder: ListQueryBuilder, connection: TransactionalConnection, entityHydrator: EntityHydrator, options: StoreCreditPluginOptions, channelService: ChannelService, orderService: OrderService, nppService: NPPService, sellerService: SellerService);
    findAll(ctx: RequestContext, options?: CreditExchangeListOptions, relations?: RelationPaths<CreditExchange>): Promise<{
        items: CreditExchange[];
        totalItems: number;
    }>;
    findOne(ctx: RequestContext, id: ID, relations?: RelationPaths<CreditExchange>): Promise<CreditExchange | null>;
    requestCreditExchange(ctx: RequestContext, amount: number): Promise<CreditExchange>;
    updateStatus(ctx: RequestContext, ids: ID[], status: string): Promise<import("typeorm").UpdateResult>;
    initiateCreditExchange(ctx: RequestContext, id: ID): Promise<import("@vendure/core").Order>;
    refund(ctx: RequestContext, id: ID): Promise<CreditExchange>;
}
