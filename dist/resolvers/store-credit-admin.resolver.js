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
exports.AdminStoreCreditResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const store_credit_entity_1 = require("../entity/store-credit.entity");
const core_1 = require("@vendure/core");
const store_credit_service_1 = require("../service/store-credit.service");
let AdminStoreCreditResolver = exports.AdminStoreCreditResolver = class AdminStoreCreditResolver {
    constructor(storeCreditService) {
        this.storeCreditService = storeCreditService;
    }
    async storeCredit(ctx, args, relations) {
        return this.storeCreditService.findOne(ctx, args.id, relations);
    }
    storeCredits(ctx, args) {
        return this.storeCreditService.findAll(ctx, args.options);
    }
    async createStoreCredit(ctx, args) {
        return this.storeCreditService.createStoreCredit(ctx, args.input);
    }
    async updateStoreCredit(ctx, args) {
        return this.storeCreditService.updateStoreCredit(ctx, args.input);
    }
    async deleteSingleStoreCredit(ctx, args) {
        return this.storeCreditService.deleteOne(ctx, args.id);
    }
    transferCreditfromSellerToCustomer(ctx, args) {
        return this.storeCreditService.transferCreditfromSellerToCustomerWithSameEmail(ctx, args.value, args.sellerId);
    }
    getSellerANDCustomerStoreCredits(ctx, args) {
        return this.storeCreditService.getSellerANDCustomerStoreCredits(ctx, args.sellerId);
    }
};
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __param(2, (0, core_1.Relations)({ entity: store_credit_entity_1.StoreCredit })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object, Array]),
    __metadata("design:returntype", Promise)
], AdminStoreCreditResolver.prototype, "storeCredit", null);
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", void 0)
], AdminStoreCreditResolver.prototype, "storeCredits", null);
__decorate([
    (0, core_1.Transaction)(),
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.SuperAdmin),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdminStoreCreditResolver.prototype, "createStoreCredit", null);
__decorate([
    (0, core_1.Transaction)(),
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.SuperAdmin),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdminStoreCreditResolver.prototype, "updateStoreCredit", null);
__decorate([
    (0, core_1.Transaction)(),
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.SuperAdmin),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdminStoreCreditResolver.prototype, "deleteSingleStoreCredit", null);
__decorate([
    (0, graphql_1.Mutation)(),
    (0, core_1.Transaction)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", void 0)
], AdminStoreCreditResolver.prototype, "transferCreditfromSellerToCustomer", null);
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", void 0)
], AdminStoreCreditResolver.prototype, "getSellerANDCustomerStoreCredits", null);
exports.AdminStoreCreditResolver = AdminStoreCreditResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [store_credit_service_1.StoreCreditService])
], AdminStoreCreditResolver);
