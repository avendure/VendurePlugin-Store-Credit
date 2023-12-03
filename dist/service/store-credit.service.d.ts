import { TransactionalConnection, RequestContext, ListQueryBuilder, ID, CustomerService, SellerService, RelationPaths, Order, OrderService, ProductVariantService, EntityHydrator } from '@vendure/core';
import { StoreCredit } from '../entity/store-credit.entity';
import { DeletionResult, StoreCreditAddInput, StoreCreditListOptions, StoreCreditUpdateInput } from '../types/credits-admin-types';
import { NPPService } from './npp.service';
import { ClaimResult } from 'src/types/credits-shop-types';
export declare class StoreCreditService {
    private connection;
    private listQueryBuilder;
    private customerService;
    private sellerService;
    private orderService;
    private productVariantService;
    private entityHydrator;
    private nppService;
    readonly nppCode = "storecredit";
    constructor(connection: TransactionalConnection, listQueryBuilder: ListQueryBuilder, customerService: CustomerService, sellerService: SellerService, orderService: OrderService, productVariantService: ProductVariantService, entityHydrator: EntityHydrator, nppService: NPPService);
    private addCredits;
    createStoreCredit(ctx: RequestContext, input: StoreCreditAddInput): Promise<StoreCredit>;
    updateStoreCredit(ctx: RequestContext, input: StoreCreditUpdateInput): Promise<StoreCredit | null>;
    deleteOne(ctx: RequestContext, id: ID): Promise<{
        result: DeletionResult;
        message: string;
    }>;
    findAll(ctx: RequestContext, options?: StoreCreditListOptions, relations?: RelationPaths<StoreCredit>): Promise<{
        items: StoreCredit[];
        totalItems: number;
    }>;
    findOne(ctx: RequestContext, id: ID, relations?: RelationPaths<StoreCredit>): Promise<StoreCredit | null>;
    addToOrder(ctx: RequestContext, creditId: ID, quantity: number, order: Order): Promise<import("@vendure/core").ErrorResultUnion<import("@vendure/common/lib/generated-shop-types").UpdateOrderItemsResult, Order>>;
    claim(ctx: RequestContext, key: string): Promise<ClaimResult>;
    transferCreditfromSellerToCustomerWithSameEmail(ctx: RequestContext, value: number, sellerId: ID): Promise<{
        customerAccountBalance: number;
        sellerAccountBalance: number;
    }>;
    getSellerANDCustomerStoreCredits(ctx: RequestContext, sellerId: ID): Promise<{
        customerAccountBalance: number;
        sellerAccountBalance: number;
    }>;
    getSellerANDCustomerStoreCreditsShop(ctx: RequestContext): Promise<{
        customerAccountBalance: number;
        sellerAccountBalance: number;
    }>;
}
