"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NPPService = void 0;
const core_1 = require("@vendure/core");
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
let NPPService = exports.NPPService = class NPPService {
    constructor(connection, channelService, configService, productService, productVariantService, productOptionGroupService, productOptionService, facetService, facetValueService, eventBus, options) {
        this.connection = connection;
        this.channelService = channelService;
        this.configService = configService;
        this.productService = productService;
        this.productVariantService = productVariantService;
        this.productOptionGroupService = productOptionGroupService;
        this.productOptionService = productOptionService;
        this.facetService = facetService;
        this.facetValueService = facetValueService;
        this.eventBus = eventBus;
        this.options = options;
        this.orderCallbacks = new Map();
    }
    onApplicationBootstrap() {
        this.channelService.initChannels().then(async () => {
            const ctx = await this.getSuperadminContext();
            core_1.Logger.info('Bootstrapping Root Non Physical Product', 'NPPPlugin');
            await this.getOrCreateRootNPP(ctx);
            await this.getOrCreateFacet(ctx);
        });
        this.eventBus.ofType(core_1.OrderPlacedEvent).subscribe(async (ev) => {
            if (ev.toState != 'PaymentSettled')
                return;
            const cbs = [];
            for (let line of ev.order.lines) {
                const productVariant = await this.productVariantService.findOne(ev.ctx, line.productVariantId, ['facetValues']);
                if (!productVariant)
                    continue;
                for (let fv of productVariant.facetValues) {
                    const cb = this.orderCallbacks.get(fv.code);
                    if (cb)
                        cbs.push(cb(ev.ctx, ev.order, line));
                }
            }
            await Promise.all(cbs);
        });
    }
    async addOrderCallback(code, callback) {
        this.orderCallbacks.set(code, callback);
    }
    async registerNppProductOption(ctx, code, name) {
        if (!ctx)
            ctx = await this.getSuperadminContext();
        const productId = await this.getRootNPPId(ctx);
        const product = await this.productService.findOne(ctx, productId, [
            'optionGroups',
            'optionGroups.options',
        ]);
        const group = product === null || product === void 0 ? void 0 : product.optionGroups.find(g => g.code == 'npps');
        if (!group)
            throw new Error('Root NPP broken');
        return (group.options.find(o => o.code == code) ||
            (await this.productOptionService.create(ctx, group, {
                code: code,
                translations: [{ languageCode: core_1.LanguageCode.en, name: name }],
            })));
    }
    async registerNppFacetValue(ctx, code, name) {
        if (!ctx)
            ctx = await this.getSuperadminContext();
        const facet = await this.getOrCreateFacet(ctx);
        return (facet.values.find(v => v.code == code) ||
            (await this.facetValueService.create(ctx, facet, {
                facetId: facet.id,
                code: code,
                translations: [{ languageCode: core_1.LanguageCode.en, name: name }],
            })));
    }
    /**
     * Call this function after deleting the product variant only
     * or else the option will either be soft deleted or won't be
     * deleted
     */
    async unregisterNppProductOption(ctx, codeOrId, isId = false) {
        var _a;
        if (!ctx)
            ctx = await this.getSuperadminContext();
        if (isId)
            return await this.productOptionService.delete(ctx, codeOrId);
        const productId = await this.getRootNPPId(ctx);
        const product = await this.productService.findOne(ctx, productId, [
            'optionGroups',
            'optionGroups.options',
        ]);
        const option = (_a = product === null || product === void 0 ? void 0 : product.optionGroups.find(og => {
            og.code == 'npps';
        })) === null || _a === void 0 ? void 0 : _a.options.find(o => o.code == codeOrId);
        if (option)
            return await this.productOptionService.delete(ctx, option.id);
    }
    async unregisterNppFacetValue(ctx, codeOrId, isId = false) {
        if (!ctx)
            ctx = await this.getSuperadminContext();
        if (isId)
            return this.facetValueService.delete(ctx, codeOrId);
        const facet = await this.getOrCreateFacet(ctx);
        const facetValue = facet.values.find(f => f.code == codeOrId);
        if (facetValue)
            return await this.facetValueService.delete(ctx, facetValue.id);
    }
    async getRootNPPId(ctx) {
        if (!ctx)
            ctx = await this.getSuperadminContext();
        const id = await this.connection
            .getRepository(ctx, core_1.GlobalSettings)
            .createQueryBuilder()
            .orderBy(this.connection.rawConnection.driver.escape('createdAt'), 'ASC')
            .getRawOne()
            .then(d => d['GlobalSettings_customFieldsRootnonphysicalproductid']);
        if (id)
            return id;
        const product = await this.getOrCreateRootNPP(ctx);
        return product.id;
    }
    async getOrCreateRootNPP(ctx) {
        const globalSettings = await this.connection.getRepository(ctx, core_1.GlobalSettings).findOne({
            where: {},
            relations: {
                customFields: {
                    RootNonPhysicalProduct: true,
                },
            },
        });
        const existingRootNPP = globalSettings === null || globalSettings === void 0 ? void 0 : globalSettings.customFields.RootNonPhysicalProduct;
        if (existingRootNPP && existingRootNPP.deletedAt == null)
            return existingRootNPP;
        const RootNPP = await this.productService.create(ctx, {
            enabled: true,
            customFields: {},
            facetValueIds: [],
            assetIds: [],
            translations: [
                {
                    languageCode: core_1.LanguageCode.en,
                    name: this.options.npp.name,
                    slug: this.options.npp.slug,
                    description: 'The root non physical product that holds other NPPs as variants',
                },
            ],
        });
        const group = await this.productOptionGroupService.create(ctx, {
            code: 'npps',
            translations: [{ languageCode: core_1.LanguageCode.en, name: 'Npps' }],
            options: [],
        });
        await this.productService.addOptionGroupToProduct(ctx, RootNPP.id, group.id);
        await this.connection
            .getRepository(ctx, core_1.GlobalSettings)
            .update({ id: globalSettings === null || globalSettings === void 0 ? void 0 : globalSettings.id }, { customFields: { RootNonPhysicalProduct: RootNPP } });
        return RootNPP;
    }
    async getOrCreateFacet(ctx) {
        return ((await this.facetService.findByCode(ctx, 'npps', core_1.LanguageCode.en)) ||
            (await this.facetService.create(ctx, {
                code: 'npps',
                isPrivate: true,
                translations: [{ languageCode: core_1.LanguageCode.en, name: 'Npps' }],
            })));
    }
    async getSuperadminContext() {
        const channel = await this.channelService.getDefaultChannel();
        const { superadminCredentials } = this.configService.authOptions;
        const superAdminUser = await this.connection.rawConnection.getRepository(core_1.User).findOneOrFail({
            where: { identifier: superadminCredentials.identifier },
        });
        return new core_1.RequestContext({
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
};
exports.NPPService = NPPService = __decorate([
    (0, common_1.Injectable)(),
    __param(10, (0, common_1.Inject)(constants_1.STORE_CREDIT_PLUGIN_OPTIONS)),
    __metadata("design:paramtypes", [core_1.TransactionalConnection,
        core_1.ChannelService,
        core_1.ConfigService,
        core_1.ProductService,
        core_1.ProductVariantService,
        core_1.ProductOptionGroupService,
        core_1.ProductOptionService,
        core_1.FacetService,
        core_1.FacetValueService,
        core_1.EventBus, Object])
], NPPService);
