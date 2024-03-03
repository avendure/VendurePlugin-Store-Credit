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
exports.CustomerEntityAdminResolver = exports.SellerEntityAdminResolver = exports.AdminStoreCreditResolver = void 0;
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
exports.AdminStoreCreditResolver = AdminStoreCreditResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [store_credit_service_1.StoreCreditService])
], AdminStoreCreditResolver);
let SellerEntityAdminResolver = exports.SellerEntityAdminResolver = class SellerEntityAdminResolver {
    constructor(storeCreditService) {
        this.storeCreditService = storeCreditService;
    }
    async storeCredit(ctx, seller) {
        var _a;
        const theUser = await this.storeCreditService.getSellerUser(ctx, seller.id);
        return (_a = theUser.customFields) === null || _a === void 0 ? void 0 : _a.sellerAccountBalance;
    }
};
__decorate([
    (0, graphql_1.ResolveField)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, core_1.Seller]),
    __metadata("design:returntype", Promise)
], SellerEntityAdminResolver.prototype, "storeCredit", null);
exports.SellerEntityAdminResolver = SellerEntityAdminResolver = __decorate([
    (0, graphql_1.Resolver)('Seller'),
    __metadata("design:paramtypes", [store_credit_service_1.StoreCreditService])
], SellerEntityAdminResolver);
let CustomerEntityAdminResolver = exports.CustomerEntityAdminResolver = class CustomerEntityAdminResolver {
    constructor(customerService) {
        this.customerService = customerService;
    }
    async storeCredit(ctx, customer) {
        var _a;
        const theCustomer = await this.customerService.findOne(ctx, customer.id, ['user']);
        if (!theCustomer) {
            throw new Error('Customer not found');
        }
        const theUser = theCustomer.user;
        if (!theUser) {
            throw new Error('Customer user not found');
        }
        return (_a = theUser.customFields) === null || _a === void 0 ? void 0 : _a.customerAccountBalance;
    }
};
__decorate([
    (0, graphql_1.ResolveField)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, core_1.Customer]),
    __metadata("design:returntype", Promise)
], CustomerEntityAdminResolver.prototype, "storeCredit", null);
exports.CustomerEntityAdminResolver = CustomerEntityAdminResolver = __decorate([
    (0, graphql_1.Resolver)('Customer'),
    __metadata("design:paramtypes", [core_1.CustomerService])
], CustomerEntityAdminResolver);
