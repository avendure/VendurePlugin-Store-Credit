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
exports.AdminCreditExchangeResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const core_1 = require("@vendure/core");
const credit_exchange_service_1 = require("../service/credit-exchange.service");
const exchange_request_entity_1 = require("../entity/exchange-request.entity");
let AdminCreditExchangeResolver = exports.AdminCreditExchangeResolver = class AdminCreditExchangeResolver {
    constructor(creditExchangeService) {
        this.creditExchangeService = creditExchangeService;
    }
    async creditExchange(ctx, args, relations) {
        const exchange = await this.creditExchangeService.findOne(ctx, args.id, relations);
        const isSuperAdmin = ctx.userHasPermissions([core_1.Permission.SuperAdmin]);
        if (!isSuperAdmin && (exchange === null || exchange === void 0 ? void 0 : exchange.sellerId) != ctx.channel.sellerId) {
            throw new core_1.EntityNotFoundError('CreditExchange', args.id);
        }
        return exchange;
    }
    creditExchanges(ctx, args) {
        const isSuperAdmin = ctx.userHasPermissions([core_1.Permission.SuperAdmin]);
        if (!isSuperAdmin) {
            const sellerId = ctx.channel.sellerId;
            if (!sellerId) {
                throw new Error('Default seller for the channel not found.');
            }
            if (!args.options)
                args.options = { filter: {} };
            args.options.filter = {
                ...args.options.filter,
                sellerId: { eq: sellerId.toString() },
            };
        }
        return this.creditExchangeService.findAll(ctx, args.options);
    }
    requestCreditExchange(ctx, args) {
        return this.creditExchangeService.requestCreditExchange(ctx, args.amount);
    }
    async updateCreditExchangeStatus(ctx, args) {
        return this.creditExchangeService
            .updateStatus(ctx, args.ids, args.status)
            .then(res => res.affected || args.ids.length);
    }
    async initiateCreditExchange(ctx, args) {
        return this.creditExchangeService.initiateCreditExchange(ctx, args.id);
    }
    async refundCreditExchange(ctx, args) {
        return this.creditExchangeService.refund(ctx, args.id);
    }
};
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.Authenticated),
    (0, core_1.Allow)(core_1.Permission.Owner),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __param(2, (0, core_1.Relations)({ entity: exchange_request_entity_1.CreditExchange })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object, Array]),
    __metadata("design:returntype", Promise)
], AdminCreditExchangeResolver.prototype, "creditExchange", null);
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.Authenticated),
    (0, core_1.Allow)(core_1.Permission.Owner),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", void 0)
], AdminCreditExchangeResolver.prototype, "creditExchanges", null);
__decorate([
    (0, core_1.Transaction)(),
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.Authenticated),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", void 0)
], AdminCreditExchangeResolver.prototype, "requestCreditExchange", null);
__decorate([
    (0, core_1.Transaction)(),
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.SuperAdmin),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdminCreditExchangeResolver.prototype, "updateCreditExchangeStatus", null);
__decorate([
    (0, core_1.Transaction)(),
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.SuperAdmin),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdminCreditExchangeResolver.prototype, "initiateCreditExchange", null);
__decorate([
    (0, core_1.Transaction)(),
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.SuperAdmin),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], AdminCreditExchangeResolver.prototype, "refundCreditExchange", null);
exports.AdminCreditExchangeResolver = AdminCreditExchangeResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [credit_exchange_service_1.CreditExchangeService])
], AdminCreditExchangeResolver);
