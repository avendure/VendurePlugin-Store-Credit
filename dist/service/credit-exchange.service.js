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
exports.CreditExchangeService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@vendure/core");
const exchange_request_entity_1 = require("../entity/exchange-request.entity");
const constants_1 = require("../constants");
const typeorm_1 = require("typeorm");
const npp_service_1 = require("./npp.service");
let CreditExchangeService = exports.CreditExchangeService = class CreditExchangeService {
    constructor(listQueryBuilder, connection, entityHydrator, options, channelService, orderService, nppService, sellerService) {
        this.listQueryBuilder = listQueryBuilder;
        this.connection = connection;
        this.entityHydrator = entityHydrator;
        this.options = options;
        this.channelService = channelService;
        this.orderService = orderService;
        this.nppService = nppService;
        this.sellerService = sellerService;
    }
    async findAll(ctx, options, relations) {
        return this.listQueryBuilder
            .build(exchange_request_entity_1.CreditExchange, options, {
            ctx,
            relations,
        })
            .getManyAndCount()
            .then(([exchanges, totalItems]) => {
            return {
                items: exchanges,
                totalItems,
            };
        });
    }
    async findOne(ctx, id, relations) {
        return this.connection.getRepository(ctx, exchange_request_entity_1.CreditExchange).findOne({
            where: {
                id,
            },
            relations,
        });
    }
    async requestCreditExchange(ctx, amount) {
        if (amount > this.options.exchange.maxAmount) {
            throw new Error(`Request amount exceed the max amount which is ${this.options.exchange.maxAmount}`);
        }
        await this.entityHydrator.hydrate(ctx, ctx.channel, {
            relations: ['seller'],
        });
        const seller = ctx.channel.seller;
        if (!seller) {
            throw new Error('Seller not found');
        }
        if ((seller === null || seller === void 0 ? void 0 : seller.customFields.accountBalance) < amount) {
            throw new Error('Insufficient Balance');
        }
        await this.connection.getRepository(ctx, core_1.Seller).update({ id: seller.id }, {
            customFields: {
                accountBalance: seller.customFields.accountBalance - amount,
            },
        });
        const exchangeFee = this.options.exchange.fee.type == 'fixed'
            ? this.options.exchange.fee.value
            : (this.options.exchange.fee.value * amount) / 100;
        const creditExchange = new exchange_request_entity_1.CreditExchange({
            seller,
            sellerId: seller.id,
            amount: amount - exchangeFee,
            status: 'Pending',
        });
        return this.connection.getRepository(ctx, exchange_request_entity_1.CreditExchange).save(creditExchange);
    }
    async updateStatus(ctx, ids, status) {
        return this.connection.getRepository(ctx, exchange_request_entity_1.CreditExchange).update({ id: (0, typeorm_1.In)(ids) }, { status });
    }
    async initiateCreditExchange(ctx, id) {
        var _a, _b, _c;
        const exchange = await this.connection.getEntityOrThrow(ctx, exchange_request_entity_1.CreditExchange, id);
        if (exchange.orderId) {
            throw new Error('Order already created for this exchange');
        }
        if (exchange.status != 'Pending') {
            throw new Error('Exchange not in pending state');
        }
        const defaultChannel = await this.channelService.getDefaultChannel(ctx);
        const superAdminSeller = await this.connection.getRepository(ctx, core_1.Seller).findOne({
            where: { id: defaultChannel.sellerId },
            relations: { customFields: { customer: { user: true } } },
        });
        if (!((_b = (_a = superAdminSeller === null || superAdminSeller === void 0 ? void 0 : superAdminSeller.customFields.customer) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id))
            throw new Error('Superadmin seller has no customer account linked');
        const order = await this.orderService.create(ctx, (_c = superAdminSeller.customFields.customer.user) === null || _c === void 0 ? void 0 : _c.id);
        const nppId = await this.nppService.getRootNPPId(ctx);
        const payoutCode = this.options.exchange.payoutOption.code;
        const payoutVariant = await this.connection
            .getRepository(ctx, core_1.ProductVariant)
            .findOne({ where: { productId: nppId, options: { code: payoutCode } } });
        if (!payoutVariant)
            throw new Error(`Payout variant not found. Create a variant with "${payoutCode} productOption under NPP.`);
        const conversionFactor = this.options.creditToCurrencyFactor[payoutVariant.currencyCode] ||
            this.options.creditToCurrencyFactor['default'];
        const exchangeAmount = Math.floor(exchange.amount / conversionFactor / 100);
        const addPaymentResult = await this.orderService.addItemToOrder(ctx, order.id, payoutVariant.id, exchangeAmount);
        if ((0, core_1.isGraphQlErrorResult)(addPaymentResult))
            throw addPaymentResult;
        exchange.orderId = addPaymentResult.id;
        exchange.order = addPaymentResult;
        exchange.status = 'Processing';
        await this.connection.getRepository(ctx, exchange_request_entity_1.CreditExchange).save(exchange);
        return addPaymentResult;
    }
    async refund(ctx, id) {
        const exchange = await this.connection.getEntityOrThrow(ctx, exchange_request_entity_1.CreditExchange, id, {
            relations: { seller: true },
        });
        if (exchange.status != 'Pending') {
            throw new Error('Exchange not in pending state');
        }
        const requestedAmount = this.options.exchange.fee.type == 'fixed'
            ? this.options.exchange.fee.value + exchange.amount
            : (100 * exchange.amount) / (100 - this.options.exchange.fee.value);
        await this.sellerService.update(ctx, {
            id: exchange.sellerId,
            customFields: {
                accountBalance: exchange.seller.customFields.accountBalance + requestedAmount,
            },
        });
        exchange.status = 'Refunded';
        return this.connection.getRepository(ctx, exchange_request_entity_1.CreditExchange).save(exchange);
    }
};
exports.CreditExchangeService = CreditExchangeService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(constants_1.STORE_CREDIT_PLUGIN_OPTIONS)),
    __metadata("design:paramtypes", [core_1.ListQueryBuilder,
        core_1.TransactionalConnection,
        core_1.EntityHydrator, Object, core_1.ChannelService,
        core_1.OrderService,
        npp_service_1.NPPService,
        core_1.SellerService])
], CreditExchangeService);
