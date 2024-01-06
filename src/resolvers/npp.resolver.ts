import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import {
    DeletionResult,
    MutationDeleteProductsArgs,
    MutationDeleteProductArgs,
    Permission,
} from '@vendure/common/lib/generated-types';
import { QueryProductsArgs, QueryProductArgs } from '@vendure/common/lib/generated-shop-types';
import {
    Allow,
    Ctx,
    Relations,
    ProductService,
    RequestContext,
    Transaction,
    Product,
    RelationPaths,
    PaginatedList,
    Translated,
    ListQueryOptions,
} from '@vendure/core';
import { NPPService } from '../service/npp.service';
// import { UserInputError } from 'apollo-server-core';

import { GraphQLError } from 'graphql';

@Resolver()
export class NppAdminResolver {
    constructor(
        private nppService: NPPService,
        private productService: ProductService,
    ) {}

    @Transaction()
    @Mutation()
    @Allow(Permission.DeleteCatalog, Permission.DeleteProduct)
    async deleteProduct(@Ctx() ctx: RequestContext, @Args() args: MutationDeleteProductArgs) {
        const nppId = await this.nppService.getRootNPPId(ctx);
        if (args.id == nppId)
            return {
                result: DeletionResult.NOT_DELETED,
                message: 'Cannot delete Root Non Physical Product',
            };

        return this.productService.softDelete(ctx, args.id);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.DeleteCatalog, Permission.DeleteProduct)
    async deleteProducts(@Ctx() ctx: RequestContext, @Args() args: MutationDeleteProductsArgs) {
        const nppId = await this.nppService.getRootNPPId(ctx);
        return Promise.all(
            args.ids.map(id => {
                if (id != nppId) return this.productService.softDelete(ctx, id);

                return {
                    result: DeletionResult.NOT_DELETED,
                    message: 'Cannot delete Root Non Physical Product',
                };
            }),
        );
    }
}

@Resolver()
export class NppShopResolver {
    constructor(
        private productService: ProductService,
        private nppService: NPPService,
    ) {}

    @Query()
    async products(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryProductsArgs,
        @Relations({ entity: Product, omit: ['variants', 'assets'] })
        relations: RelationPaths<Product>,
    ): Promise<PaginatedList<Translated<Product>>> {
        const nppId = await this.nppService.getRootNPPId(ctx);
        const options: ListQueryOptions<Product> = {
            ...args.options,
            filter: {
                ...(args.options && args.options.filter),
                enabled: { eq: true },
                id: { notEq: `${nppId}` },
            },
        };
        return this.productService.findAll(ctx, options, relations);
    }

    @Query()
    async product(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryProductArgs,
        @Relations({ entity: Product, omit: ['variants', 'assets'] })
        relations: RelationPaths<Product>,
    ): Promise<Translated<Product> | undefined> {
        let result: Translated<Product> | undefined;
        if (args.id) {
            result = await this.productService.findOne(ctx, args.id, relations);
        } else if (args.slug) {
            result = await this.productService.findOneBySlug(ctx, args.slug, relations);
        } else {
            // throw new UserInputError('error.product-id-or-slug-must-be-provided'); V3
            //Upgrade to apollo server v4
            throw new GraphQLError('error.product-id-or-slug-must-be-provided', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    myExtension: 'foo',
                },
            });
        }
        const nppId = await this.nppService.getRootNPPId(ctx);
        if (!result || result.id == nppId || result.enabled === false) {
            return;
        }
        result.facetValues = result.facetValues?.filter(fv => !fv.facet.isPrivate) as any;
        return result;
    }
}
