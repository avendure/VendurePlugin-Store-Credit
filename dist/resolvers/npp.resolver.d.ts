import { DeletionResult, MutationDeleteProductsArgs, MutationDeleteProductArgs } from '@vendure/common/lib/generated-types';
import { QueryProductsArgs, QueryProductArgs } from '@vendure/common/lib/generated-shop-types';
import { ProductService, RequestContext, Product, RelationPaths, PaginatedList, Translated } from '@vendure/core';
import { NPPService } from '../service/npp.service';
export declare class NppAdminResolver {
    private nppService;
    private productService;
    constructor(nppService: NPPService, productService: ProductService);
    deleteProduct(ctx: RequestContext, args: MutationDeleteProductArgs): Promise<import("@vendure/common/lib/generated-types").DeletionResponse>;
    deleteProducts(ctx: RequestContext, args: MutationDeleteProductsArgs): Promise<(import("@vendure/common/lib/generated-types").DeletionResponse | {
        result: DeletionResult;
        message: string;
    })[]>;
}
export declare class NppShopResolver {
    private productService;
    private nppService;
    constructor(productService: ProductService, nppService: NPPService);
    products(ctx: RequestContext, args: QueryProductsArgs, relations: RelationPaths<Product>): Promise<PaginatedList<Translated<Product>>>;
    product(ctx: RequestContext, args: QueryProductArgs, relations: RelationPaths<Product>): Promise<Translated<Product> | undefined>;
}
