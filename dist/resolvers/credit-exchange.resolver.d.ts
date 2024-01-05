import { ID, RelationPaths, RequestContext } from '@vendure/core';
import { MutationRequestCreditExchangeArgs, QueryCreditExchangeArgs, QueryCreditExchangesArgs } from '../types/credits-admin-types';
import { CreditExchangeService } from '../service/credit-exchange.service';
import { CreditExchange } from '../entity/exchange-request.entity';
export declare class AdminCreditExchangeResolver {
    private creditExchangeService;
    constructor(creditExchangeService: CreditExchangeService);
    creditExchange(ctx: RequestContext, args: QueryCreditExchangeArgs, relations: RelationPaths<CreditExchange>): Promise<CreditExchange | null>;
    creditExchanges(ctx: RequestContext, args: QueryCreditExchangesArgs): Promise<{
        items: CreditExchange[];
        totalItems: number;
    }>;
    requestCreditExchange(ctx: RequestContext, args: MutationRequestCreditExchangeArgs): Promise<CreditExchange>;
    updateCreditExchangeStatus(ctx: RequestContext, args: {
        ids: ID[];
        status: string;
    }): Promise<number>;
    initiateCreditExchange(ctx: RequestContext, args: {
        id: ID;
    }): Promise<import("@vendure/core").Order>;
    refundCreditExchange(ctx: RequestContext, args: {
        id: ID;
    }): Promise<CreditExchange>;
}
