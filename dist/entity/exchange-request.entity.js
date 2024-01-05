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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditExchange = void 0;
const core_1 = require("@vendure/core");
const typeorm_1 = require("typeorm");
const entity_id_decorator_1 = require("@vendure/core/dist/entity/entity-id.decorator");
let CreditExchange = exports.CreditExchange = class CreditExchange extends core_1.VendureEntity {
    constructor(input) {
        super(input);
    }
};
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CreditExchange.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], CreditExchange.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => core_1.Order, { eager: true, nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'orderId' }),
    __metadata("design:type", core_1.Order)
], CreditExchange.prototype, "order", void 0);
__decorate([
    (0, entity_id_decorator_1.EntityId)({ nullable: true }),
    __metadata("design:type", Object)
], CreditExchange.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => core_1.Seller, {
        eager: true,
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'sellerId' }),
    __metadata("design:type", core_1.Seller)
], CreditExchange.prototype, "seller", void 0);
__decorate([
    (0, entity_id_decorator_1.EntityId)({ nullable: false }),
    __metadata("design:type", Object)
], CreditExchange.prototype, "sellerId", void 0);
exports.CreditExchange = CreditExchange = __decorate([
    (0, typeorm_1.Entity)(),
    __metadata("design:paramtypes", [Object])
], CreditExchange);
