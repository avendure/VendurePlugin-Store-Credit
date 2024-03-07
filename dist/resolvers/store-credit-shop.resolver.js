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
exports.CustomerEntityShopResolver = exports.SellerEntityShopResolver = exports.ShopStoreCreditResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const core_1 = require("@vendure/core");
const store_credit_service_1 = require("../service/store-credit.service");
const active_order_strategy_1 = require("@vendure/core/dist/config/order/active-order-strategy");
let ShopStoreCreditResolver = exports.ShopStoreCreditResolver = class ShopStoreCreditResolver {
    constructor(storeCreditService, activeOrderService, orderService) {
        this.storeCreditService = storeCreditService;
        this.activeOrderService = activeOrderService;
        this.orderService = orderService;
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
    async addItemToOrder(ctx, args) {
        await this.storeCreditService.testIfSameSellerAndCustomer(ctx, args.productVariantId);
        const order = await this.activeOrderService.getActiveOrder(ctx, args[active_order_strategy_1.ACTIVE_ORDER_INPUT_FIELD_NAME], true);
        return this.orderService.addItemToOrder(ctx, order.id, args.productVariantId, args.quantity, args.customFields);
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
    (0, core_1.Transaction)(),
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.UpdateOrder, core_1.Permission.Owner),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], ShopStoreCreditResolver.prototype, "addItemToOrder", null);
exports.ShopStoreCreditResolver = ShopStoreCreditResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [store_credit_service_1.StoreCreditService,
        core_1.ActiveOrderService,
        core_1.OrderService])
], ShopStoreCreditResolver);
let SellerEntityShopResolver = exports.SellerEntityShopResolver = class SellerEntityShopResolver {
    constructor(storeCreditService) {
        this.storeCreditService = storeCreditService;
    }
    async storeCredit(ctx, seller) {
        var _a;
        const theUser = await this.storeCreditService.getSellerUser(ctx, seller.id);
        return (_a = theUser.customFields) === null || _a === void 0 ? void 0 : _a.accountBalance;
    }
};
__decorate([
    (0, graphql_1.ResolveField)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, core_1.Seller]),
    __metadata("design:returntype", Promise)
], SellerEntityShopResolver.prototype, "storeCredit", null);
exports.SellerEntityShopResolver = SellerEntityShopResolver = __decorate([
    (0, graphql_1.Resolver)('Seller'),
    __metadata("design:paramtypes", [store_credit_service_1.StoreCreditService])
], SellerEntityShopResolver);
let CustomerEntityShopResolver = exports.CustomerEntityShopResolver = class CustomerEntityShopResolver {
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
        return (_a = theUser.customFields) === null || _a === void 0 ? void 0 : _a.accountBalance;
    }
};
__decorate([
    (0, graphql_1.ResolveField)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, core_1.Customer]),
    __metadata("design:returntype", Promise)
], CustomerEntityShopResolver.prototype, "storeCredit", null);
exports.CustomerEntityShopResolver = CustomerEntityShopResolver = __decorate([
    (0, graphql_1.Resolver)('Customer'),
    __metadata("design:paramtypes", [core_1.CustomerService])
], CustomerEntityShopResolver);
