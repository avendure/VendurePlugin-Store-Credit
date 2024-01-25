import {
    ChannelService,
    ConfigService,
    EventBus,
    FacetService,
    FacetValueService,
    GlobalSettings,
    ID,
    LanguageCode,
    Logger,
    Order,
    OrderLine,
    OrderPlacedEvent,
    Product,
    ProductOptionGroupService,
    ProductOptionService,
    ProductService,
    ProductVariantService,
    RequestContext,
    TransactionalConnection,
    User,
} from '@vendure/core';

import { Injectable, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { STORE_CREDIT_PLUGIN_OPTIONS } from '../constants';
import { StoreCreditPluginOptions } from 'src/types/options';

export type NppPurchaseCallback = (ctx: RequestContext, order: Order, line: OrderLine) => Promise<any>;

@Injectable()
export class NPPService implements OnApplicationBootstrap {
    orderCallbacks = new Map<string, NppPurchaseCallback>();

    constructor(
        private connection: TransactionalConnection,
        private channelService: ChannelService,
        private configService: ConfigService,
        private productService: ProductService,
        private productVariantService: ProductVariantService,
        private productOptionGroupService: ProductOptionGroupService,
        private productOptionService: ProductOptionService,
        private facetService: FacetService,
        private facetValueService: FacetValueService,
        private eventBus: EventBus,
        @Inject(STORE_CREDIT_PLUGIN_OPTIONS)
        private options: StoreCreditPluginOptions,
    ) {}

    onApplicationBootstrap() {
        if (this.options.npp) {
            this.channelService.initChannels().then(async () => {
                const ctx = await this.getSuperadminContext();
                Logger.info('Bootstrapping Root Non Physical Product', 'NPPPlugin');

                await this.getOrCreateRootNPP(ctx);
                await this.getOrCreateFacet(ctx);
                await this.registerNppProductOption(
                    ctx,
                    this.options.exchange.payoutOption.code,
                    this.options.exchange.payoutOption.name,
                );
            });

            this.eventBus.ofType(OrderPlacedEvent).subscribe(async ev => {
                if (ev.toState != 'PaymentSettled') return;

                const cbs: Promise<ReturnType<NppPurchaseCallback>>[] = [];

                for (let line of ev.order.lines) {
                    const productVariant = await this.productVariantService.findOne(
                        ev.ctx,
                        line.productVariantId,
                        ['facetValues'],
                    );
                    if (!productVariant) continue;
                    for (let fv of productVariant.facetValues) {
                        const cb = this.orderCallbacks.get(fv.code);
                        if (cb) cbs.push(cb(ev.ctx, ev.order, line));
                    }
                }

                await Promise.all(cbs);
            });
        }
    }

    public async addOrderCallback(code: string, callback: NppPurchaseCallback) {
        this.orderCallbacks.set(code, callback);
    }

    public async registerNppProductOption(ctx: RequestContext | undefined, code: string, name: string) {
        if (!ctx) ctx = await this.getSuperadminContext();
        const productId = await this.getRootNPPId(ctx);
        const product = await this.productService.findOne(ctx, productId, [
            'optionGroups',
            'optionGroups.options',
        ]);
        const group = product?.optionGroups.find(g => g.code == 'npps');
        if (!group) throw new Error('Root NPP broken');
        return (
            group.options.find(o => o.code == code) ||
            (await this.productOptionService.create(ctx, group, {
                code: code,
                translations: [{ languageCode: LanguageCode.en, name: name }],
            }))
        );
    }
    public async registerNppFacetValue(ctx: RequestContext | undefined, code: string, name: string) {
        if (!ctx) ctx = await this.getSuperadminContext();

        const facet = await this.getOrCreateFacet(ctx);
        return (
            facet.values.find(v => v.code == code) ||
            (await this.facetValueService.create(ctx, facet, {
                facetId: facet.id,
                code: code,
                translations: [{ languageCode: LanguageCode.en, name: name }],
            }))
        );
    }

    /**
     * Call this function after deleting the product variant only
     * or else the option will either be soft deleted or won't be
     * deleted
     */
    public async unregisterNppProductOption(
        ctx: RequestContext | undefined,
        codeOrId: string | number,
        isId = false,
    ) {
        if (!ctx) ctx = await this.getSuperadminContext();

        if (isId) return await this.productOptionService.delete(ctx, codeOrId);

        const productId = await this.getRootNPPId(ctx);
        const product = await this.productService.findOne(ctx, productId, [
            'optionGroups',
            'optionGroups.options',
        ]);
        const option = product?.optionGroups
            .find(og => {
                og.code == 'npps';
            })
            ?.options.find(o => o.code == codeOrId);
        if (option) return await this.productOptionService.delete(ctx, option.id);
    }

    public async unregisterNppFacetValue(
        ctx: RequestContext | undefined,
        codeOrId: string | number,
        isId = false,
    ) {
        if (!ctx) ctx = await this.getSuperadminContext();

        if (isId) return this.facetValueService.delete(ctx, codeOrId);

        const facet = await this.getOrCreateFacet(ctx);
        const facetValue = facet.values.find(f => f.code == codeOrId);
        if (facetValue) return await this.facetValueService.delete(ctx, facetValue.id);
    }

    public async getRootNPPId(ctx: RequestContext | undefined) {
        if (!ctx) ctx = await this.getSuperadminContext();
        const id = await this.connection
            .getRepository(ctx, GlobalSettings)
            .createQueryBuilder()
            .orderBy(this.connection.rawConnection.driver.escape('createdAt'), 'ASC')
            .getRawOne()
            .then(d => d['GlobalSettings_customFieldsRootnonphysicalproductid'] as ID);
        if (id) return id;

        const product = await this.getOrCreateRootNPP(ctx);
        return product.id;
    }

    private async getOrCreateRootNPP(ctx: RequestContext) {
        if (this.options.npp) {
            const globalSettings = await this.connection.getRepository(ctx, GlobalSettings).findOne({
                where: {},
                relations: {
                    customFields: {
                        RootNonPhysicalProduct: true,
                    },
                },
            });
            const existingRootNPP = globalSettings?.customFields.RootNonPhysicalProduct;
            if (existingRootNPP && existingRootNPP.deletedAt == null) return existingRootNPP;

            const RootNPP = await this.productService.create(ctx, {
                enabled: true,
                customFields: {},
                facetValueIds: [],
                assetIds: [],
                translations: [
                    {
                        languageCode: LanguageCode.en,
                        name: this.options.npp.name,
                        slug: this.options.npp.slug,
                        description: 'The root non physical product that holds other NPPs as variants',
                    },
                ],
            });

            const group = await this.productOptionGroupService.create(ctx, {
                code: 'npps',
                translations: [{ languageCode: LanguageCode.en, name: 'Npps' }],
                options: [],
            });

            await this.productService.addOptionGroupToProduct(ctx, RootNPP.id, group.id);

            await this.connection
                .getRepository(ctx, GlobalSettings)
                .update({ id: globalSettings?.id }, { customFields: { RootNonPhysicalProduct: RootNPP } });

            return RootNPP;
        }
        return {} as Product;
    }

    private async getOrCreateFacet(ctx: RequestContext) {
        return (
            (await this.facetService.findByCode(ctx, 'npps', LanguageCode.en)) ||
            (await this.facetService.create(ctx, {
                code: 'npps',
                isPrivate: true,
                translations: [{ languageCode: LanguageCode.en, name: 'Npps' }],
            }))
        );
    }

    private async getSuperadminContext() {
        const channel = await this.channelService.getDefaultChannel();
        const { superadminCredentials } = this.configService.authOptions;
        const superAdminUser = await this.connection.rawConnection.getRepository(User).findOneOrFail({
            where: { identifier: superadminCredentials.identifier },
        });

        return new RequestContext({
            channel,
            apiType: 'admin',
            isAuthorized: true,
            authorizedAsOwnerOnly: false,
            session: {
                id: '',
                token: '',
                expires: new Date(),
                cacheExpiry: 999999,
                user: {
                    id: superAdminUser.id,
                    identifier: superAdminUser.identifier,
                    verified: true,
                    channelPermissions: [],
                },
            },
        });
    }
}
