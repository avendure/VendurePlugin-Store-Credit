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
exports.StoreCreditService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@vendure/core");
const store_credit_entity_1 = require("../entity/store-credit.entity");
const typeorm_1 = require("typeorm");
const credits_admin_types_1 = require("../types/credits-admin-types");
const npp_service_1 = require("./npp.service");
let StoreCreditService = exports.StoreCreditService = class StoreCreditService {
    constructor(connection, listQueryBuilder, customerService, userService, sellerService, orderService, productVariantService, entityHydrator, nppService, channelService) {
        this.connection = connection;
        this.listQueryBuilder = listQueryBuilder;
        this.customerService = customerService;
        this.userService = userService;
        this.sellerService = sellerService;
        this.orderService = orderService;
        this.productVariantService = productVariantService;
        this.entityHydrator = entityHydrator;
        this.nppService = nppService;
        this.channelService = channelService;
        this.nppCode = 'storecredit';
        this.nppService.addOrderCallback(this.nppCode, this.addCredits.bind(this));
    }
    async addCredits(ctx, order, line) {
        if (!order.customer)
            throw new Error('Order customer not set.');
        const storeCredit = await this.connection
            .getRepository(ctx, store_credit_entity_1.StoreCredit)
            .findOne({ where: { variantId: line.productVariantId } });
        if (!storeCredit)
            throw new core_1.EntityNotFoundError('StoreCredit', 0);
        const theCustomer = await this.customerService.findOne(ctx, order.customer.id, ['user']);
        if (!theCustomer)
            throw new core_1.EntityNotFoundError('Customer', order.customer.id);
        if (!theCustomer.user)
            throw new Error(`User not found for customer : ${theCustomer.id}`);
        const newBalance = (theCustomer.user.customFields.accountBalance || 0) + storeCredit.value * line.quantity;
        await this.connection.getRepository(ctx, core_1.User).update({ id: theCustomer.user.id }, {
            customFields: {
                accountBalance: newBalance,
            }
        });
        return newBalance;
    }
    async createStoreCredit(ctx, input) {
        const code = `store-credit-${input.value}-pts`;
        let createdVariant = undefined;
        if (input.name && input.price) {
            const facetValue = await this.nppService.registerNppFacetValue(ctx, this.nppCode, 'Store Credit');
            const productOption = await this.nppService.registerNppProductOption(ctx, code, input.name.toLowerCase());
            const pid = await this.nppService.getRootNPPId(ctx);
            const variant = await this.productVariantService.create(ctx, [
                {
                    price: 1000,
                    productId: pid,
                    sku: 'STORE_CREDIT',
                    trackInventory: credits_admin_types_1.GlobalFlag.FALSE,
                    translations: [{ languageCode: core_1.LanguageCode.en, name: input.name }],
                    optionIds: [productOption.id],
                    facetValueIds: [facetValue.id],
                },
            ]);
            createdVariant = variant[0];
        }
        const storeCreditEntry = new store_credit_entity_1.StoreCredit({
            perUserLimit: input.perUserLimit,
            value: input.value || 0,
            variant: createdVariant,
        });
        return this.connection.getRepository(ctx, store_credit_entity_1.StoreCredit).save(storeCreditEntry);
    }
    async updateStoreCredit(ctx, input) {
        var _a, _b;
        const storeCredit = await this.connection.getEntityOrThrow(ctx, store_credit_entity_1.StoreCredit, input.id);
        storeCredit.value = (_a = input.value) !== null && _a !== void 0 ? _a : storeCredit.value;
        storeCredit.perUserLimit = (_b = input.perUserLimit) !== null && _b !== void 0 ? _b : storeCredit.perUserLimit;
        if (input.name && storeCredit.variantId)
            await this.productVariantService.update(ctx, [
                {
                    id: storeCredit.variantId,
                    translations: [{ languageCode: core_1.LanguageCode.en, name: input.name }],
                },
            ]);
        return this.connection.getRepository(ctx, store_credit_entity_1.StoreCredit).save(storeCredit);
    }
    async deleteOne(ctx, id) {
        const cred = await this.findOne(ctx, id, ['variant']);
        if (!cred)
            return {
                result: credits_admin_types_1.DeletionResult.NOT_DELETED,
                message: 'Store credit not found.',
            };
        if (cred.variant && cred.variantId) {
            this.entityHydrator.hydrate(ctx, cred.variant, {
                relations: ['options'],
            });
            await this.productVariantService.softDelete(ctx, cred.variantId);
            for (let option of cred.variant.options)
                await this.nppService.unregisterNppProductOption(ctx, option.id, true);
        }
        const resp = await this.connection.getRepository(ctx, store_credit_entity_1.StoreCredit).delete({ id });
        return resp.affected
            ? {
                result: credits_admin_types_1.DeletionResult.DELETED,
                message: 'Store Credit deleted successfully',
            }
            : { result: credits_admin_types_1.DeletionResult.NOT_DELETED, message: 'Something went wrong' };
    }
    async findAll(ctx, options, relations) {
        return this.listQueryBuilder
            .build(store_credit_entity_1.StoreCredit, options, {
            ctx,
            where: {
                variant: { deletedAt: (0, typeorm_1.IsNull)() },
                ...(ctx.apiType == 'shop' ? { variantId: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) } : {}),
            },
            relations,
        })
            .getManyAndCount()
            .then(([storeCredits, totalItems]) => {
            return {
                items: storeCredits,
                totalItems,
            };
        });
    }
    async findOne(ctx, id, relations) {
        return this.connection.getRepository(ctx, store_credit_entity_1.StoreCredit).findOne({
            where: {
                id,
                variant: { deletedAt: (0, typeorm_1.IsNull)() },
                ...(ctx.apiType == 'shop' ? { variantId: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) } : {}),
            },
            relations,
        });
    }
    async addToOrder(ctx, creditId, quantity, order) {
        const cred = await this.findOne(ctx, creditId);
        if (!cred || !cred.variantId)
            throw new core_1.EntityNotFoundError('Store Credit', creditId);
        if (!order.customer)
            throw new Error('Order customer not set');
        const theCustomer = await this.customerService.findOne(ctx, order.customer.id, ['user']);
        if (!theCustomer)
            throw new core_1.EntityNotFoundError('Customer', order.customer.id);
        if (!theCustomer.user)
            throw new Error(`User not found for customer : ${theCustomer.id}`);
        if (theCustomer.user.customFields.accountBalance >= cred.perUserLimit)
            throw new Error('User cannot buy this credit.');
        return this.orderService.addItemToOrder(ctx, order.id, cred.variantId, quantity);
    }
    async claim(ctx, key) {
        if (!ctx.activeUserId)
            return { success: false, message: 'Not logged in' };
        const credit = await this.connection.getRepository(ctx, store_credit_entity_1.StoreCredit).findOne({ where: { key } });
        if (!credit || credit.userId)
            return { success: false, message: 'Invalid key' };
        const customer = await this.customerService.findOneByUserId(ctx, ctx.activeUserId);
        if (!customer)
            return { success: false, message: 'Invalid customer' };
        const user = await this.userService.getUserById(ctx, ctx.activeUserId);
        if (!user)
            return { success: false, message: 'Invalid user' };
        const currentBalance = user.customFields.accountBalance || 0;
        const newBalance = currentBalance + credit.value;
        await this.connection.getRepository(ctx, core_1.User).update({ id: user.id }, {
            customFields: {
                accountBalance: newBalance,
            }
        });
        credit.user = user;
        await this.connection.getRepository(ctx, store_credit_entity_1.StoreCredit).save(credit, { reload: false });
        return {
            success: true,
            message: 'Successfully claimed credit',
            addedCredit: credit.value,
            currentBalance: newBalance,
        };
    }
    async testIfSameSellerAndCustomer(ctx, productVariantId) {
        const theVariant = await this.productVariantService.findOne(ctx, productVariantId, ['channels', 'channels.seller']);
        if (!theVariant)
            throw new core_1.EntityNotFoundError('ProductVariant', productVariantId);
        const defaultChannel = await this.channelService.getDefaultChannel();
        const theVariantChannel = theVariant.channels.find(c => c.id != defaultChannel.id);
        if (!theVariantChannel) {
            // allow order if no seller channel is found since its default channel
            return;
        }
        if (!theVariantChannel.sellerId) {
            throw new Error('No seller found for the product');
        }
        const sellerUser = await this.getSellerUser(ctx, theVariantChannel.sellerId);
        if (!sellerUser) {
            throw new Error('No user found for the seller');
        }
        if (sellerUser.id == ctx.activeUserId) {
            throw new Error('Seller and customer cannot be the same');
        }
    }
    async getSellerUser(ctx, sellerId) {
        const theChannel = await this.connection.getRepository(ctx, core_1.Channel).findOne({
            where: {
                sellerId: sellerId,
            }
        });
        if (!theChannel)
            throw new core_1.EntityNotFoundError('Channel', 0);
        const theRole = await this.connection.getRepository(ctx, core_1.Role).findOne({
            where: {
                channels: {
                    id: theChannel.id,
                },
            },
            relations: ['channels']
        });
        if (!theRole)
            throw new core_1.EntityNotFoundError('Role', 0);
        const theUser = await this.connection.getRepository(ctx, core_1.User).findOne({
            where: {
                roles: {
                    id: theRole.id,
                },
                deletedAt: (0, typeorm_1.IsNull)(),
            },
            relations: ['roles']
        });
        if (!theUser)
            throw new core_1.EntityNotFoundError('User', 0);
        return theUser;
    }
};
exports.StoreCreditService = StoreCreditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.TransactionalConnection,
        core_1.ListQueryBuilder,
        core_1.CustomerService,
        core_1.UserService,
        core_1.SellerService,
        core_1.OrderService,
        core_1.ProductVariantService,
        core_1.EntityHydrator,
        npp_service_1.NPPService,
        core_1.ChannelService])
], StoreCreditService);
