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
exports.ShopStoreCreditResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const core_1 = require("@vendure/core");
const store_credit_service_1 = require("../service/store-credit.service");
const active_order_strategy_1 = require("@vendure/core/dist/config/order/active-order-strategy");
let ShopStoreCreditResolver = exports.ShopStoreCreditResolver = class ShopStoreCreditResolver {
    constructor(storeCreditService, activeOrderService) {
        this.storeCreditService = storeCreditService;
        this.activeOrderService = activeOrderService;
    }
    async storeCredit(ctx, args) {
        return this.storeCreditService.findOne(ctx, args.id);
    }
    storeCredits(ctx, args) {
        return this.storeCreditService.findAll(ctx, args.options);
    }
    async addCreditToOrder(ctx, args) {
        const order = await this.activeOrderService.getActiveOrder(ctx, args[active_order_strategy_1.ACTIVE_ORDER_INPUT_FIELD_NAME], true);
        return this.storeCreditService.addToOrder(ctx, args.creditId, args.quantity, order);
    }
    async claim(ctx, args) {
        return this.storeCreditService.claim(ctx, args.key);
    }
    async getSellerANDCustomerStoreCredits(ctx) {
        return this.storeCreditService.getSellerANDCustomerStoreCreditsShop(ctx);
    }
};
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopStoreCreditResolver.prototype, "storeCredit", null);
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", void 0)
], ShopStoreCreditResolver.prototype, "storeCredits", null);
__decorate([
    (0, graphql_1.Mutation)(),
    (0, core_1.Transaction)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopStoreCreditResolver.prototype, "addCreditToOrder", null);
__decorate([
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.Authenticated),
    (0, core_1.Transaction)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopStoreCreditResolver.prototype, "claim", null);
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.Authenticated),
    (0, core_1.Transaction)(),
    __param(0, (0, core_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext]),
    __metadata("design:returntype", Promise)
], ShopStoreCreditResolver.prototype, "getSellerANDCustomerStoreCredits", null);
exports.ShopStoreCreditResolver = ShopStoreCreditResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [store_credit_service_1.StoreCreditService,
        core_1.ActiveOrderService])
], ShopStoreCreditResolver);
