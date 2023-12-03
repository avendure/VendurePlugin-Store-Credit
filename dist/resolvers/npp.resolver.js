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
exports.NppShopResolver = exports.NppAdminResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const generated_types_1 = require("@vendure/common/lib/generated-types");
const core_1 = require("@vendure/core");
const npp_service_1 = require("../service/npp.service");
const apollo_server_core_1 = require("apollo-server-core");
let NppAdminResolver = exports.NppAdminResolver = class NppAdminResolver {
    constructor(nppService, productService) {
        this.nppService = nppService;
        this.productService = productService;
    }
    async deleteProduct(ctx, args) {
        const nppId = await this.nppService.getRootNPPId(ctx);
        if (args.id == nppId)
            return {
                result: generated_types_1.DeletionResult.NOT_DELETED,
                message: 'Cannot delete Root Non Physical Product',
            };
        return this.productService.softDelete(ctx, args.id);
    }
    async deleteProducts(ctx, args) {
        const nppId = await this.nppService.getRootNPPId(ctx);
        return Promise.all(args.ids.map(id => {
            if (id != nppId)
                return this.productService.softDelete(ctx, id);
            return {
                result: generated_types_1.DeletionResult.NOT_DELETED,
                message: 'Cannot delete Root Non Physical Product',
            };
        }));
    }
};
__decorate([
    (0, core_1.Transaction)(),
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(generated_types_1.Permission.DeleteCatalog, generated_types_1.Permission.DeleteProduct),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], NppAdminResolver.prototype, "deleteProduct", null);
__decorate([
    (0, core_1.Transaction)(),
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(generated_types_1.Permission.DeleteCatalog, generated_types_1.Permission.DeleteProduct),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], NppAdminResolver.prototype, "deleteProducts", null);
exports.NppAdminResolver = NppAdminResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [npp_service_1.NPPService,
        core_1.ProductService])
], NppAdminResolver);
let NppShopResolver = exports.NppShopResolver = class NppShopResolver {
    constructor(productService, nppService) {
        this.productService = productService;
        this.nppService = nppService;
    }
    async products(ctx, args, relations) {
        const nppId = await this.nppService.getRootNPPId(ctx);
        const options = {
            ...args.options,
            filter: {
                ...(args.options && args.options.filter),
                enabled: { eq: true },
                id: { notEq: `${nppId}` },
            },
        };
        return this.productService.findAll(ctx, options, relations);
    }
    async product(ctx, args, relations) {
        var _a;
        let result;
        if (args.id) {
            result = await this.productService.findOne(ctx, args.id, relations);
        }
        else if (args.slug) {
            result = await this.productService.findOneBySlug(ctx, args.slug, relations);
        }
        else {
            throw new apollo_server_core_1.UserInputError('error.product-id-or-slug-must-be-provided');
        }
        const nppId = await this.nppService.getRootNPPId(ctx);
        if (!result || result.id == nppId || result.enabled === false) {
            return;
        }
        result.facetValues = (_a = result.facetValues) === null || _a === void 0 ? void 0 : _a.filter(fv => !fv.facet.isPrivate);
        return result;
    }
};
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __param(2, (0, core_1.Relations)({ entity: core_1.Product, omit: ['variants', 'assets'] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object, Array]),
    __metadata("design:returntype", Promise)
], NppShopResolver.prototype, "products", null);
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __param(2, (0, core_1.Relations)({ entity: core_1.Product, omit: ['variants', 'assets'] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object, Array]),
    __metadata("design:returntype", Promise)
], NppShopResolver.prototype, "product", null);
exports.NppShopResolver = NppShopResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [core_1.ProductService,
        npp_service_1.NPPService])
], NppShopResolver);
