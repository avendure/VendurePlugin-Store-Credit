import { ChannelService, ConfigService, EventBus, FacetService, FacetValueService, ID, Order, OrderLine, ProductOptionGroupService, ProductOptionService, ProductService, ProductVariantService, RequestContext, TransactionalConnection } from '@vendure/core';
import { OnApplicationBootstrap } from '@nestjs/common';
import { StoreCreditPluginOptions } from '../types/options';
export type NppPurchaseCallback = (ctx: RequestContext, order: Order, line: OrderLine) => Promise<any>;
export declare class NPPService implements OnApplicationBootstrap {
    private connection;
    private channelService;
    private configService;
    private productService;
    private productVariantService;
    private productOptionGroupService;
    private productOptionService;
    private facetService;
    private facetValueService;
    private eventBus;
    private options;
    orderCallbacks: Map<string, NppPurchaseCallback>;
    constructor(connection: TransactionalConnection, channelService: ChannelService, configService: ConfigService, productService: ProductService, productVariantService: ProductVariantService, productOptionGroupService: ProductOptionGroupService, productOptionService: ProductOptionService, facetService: FacetService, facetValueService: FacetValueService, eventBus: EventBus, options: StoreCreditPluginOptions);
    onApplicationBootstrap(): void;
    addOrderCallback(code: string, callback: NppPurchaseCallback): Promise<void>;
    registerNppProductOption(ctx: RequestContext | undefined, code: string, name: string): Promise<import("@vendure/core").ProductOption>;
    registerNppFacetValue(ctx: RequestContext | undefined, code: string, name: string): Promise<import("@vendure/core").FacetValue>;
    /**
     * Call this function after deleting the product variant only
     * or else the option will either be soft deleted or won't be
     * deleted
     */
    unregisterNppProductOption(ctx: RequestContext | undefined, codeOrId: string | number, isId?: boolean): Promise<import("@vendure/common/lib/generated-types").DeletionResponse | undefined>;
    unregisterNppFacetValue(ctx: RequestContext | undefined, codeOrId: string | number, isId?: boolean): Promise<import("@vendure/common/lib/generated-types").DeletionResponse | undefined>;
    getRootNPPId(ctx: RequestContext | undefined): Promise<ID>;
    private getOrCreateRootNPP;
    private getOrCreateFacet;
    private getSuperadminContext;
}
