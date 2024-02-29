import { Injectable } from '@nestjs/common';
import {
    TransactionalConnection,
    RequestContext,
    ListQueryBuilder,
    ID,
    CustomerService,
    SellerService,
    Customer,
    Seller,
    RelationPaths,
    Order,
    EntityNotFoundError,
    OrderService,
    OrderLine,
    ProductVariantService,
    LanguageCode,
    ProductVariant,
    EntityHydrator,
    UnauthorizedError,
    UserService,
    User,
    Channel,
    Administrator,
    Role,
} from '@vendure/core';
import { StoreCredit } from '../entity/store-credit.entity';
import { IsNull, Not } from 'typeorm';

import {
    DeletionResult,
    GlobalFlag,
    StoreCreditAddInput,
    StoreCreditListOptions,
    StoreCreditUpdateInput,
} from '../types/credits-admin-types';
import { NPPService } from './npp.service';
import { ClaimResult } from '../types/credits-shop-types';

@Injectable()
export class StoreCreditService {
    readonly nppCode = 'storecredit';

    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private customerService: CustomerService,
        private userService: UserService,
        private sellerService: SellerService,
        private orderService: OrderService,
        private productVariantService: ProductVariantService,
        private entityHydrator: EntityHydrator,
        private nppService: NPPService,
    ) {
        this.nppService.addOrderCallback(this.nppCode, this.addCredits.bind(this));
    }

    private async addCredits(ctx: RequestContext, order: Order, line: OrderLine) {
        if (!order.customer) throw new Error('Order customer not set.');

        const storeCredit = await this.connection
            .getRepository(ctx, StoreCredit)
            .findOne({ where: { variantId: line.productVariantId } });
        if (!storeCredit) throw new EntityNotFoundError('StoreCredit', 0);

        const theCustomer = await this.customerService.findOne(ctx, order.customer.id, ['user']);
        if (!theCustomer) throw new EntityNotFoundError('Customer', order.customer.id);
        if (!theCustomer.user) throw new Error(`User not found for customer : ${theCustomer.id}`);

        const newBalance =
            (theCustomer.user.customFields.customerAccountBalance || 0) + storeCredit.value * line.quantity;

        await this.connection.getRepository(ctx, User).update({ id: theCustomer.user.id }, {
            customFields: {
                customerAccountBalance: newBalance,
            }
        });

        return newBalance;
    }

    async createStoreCredit(ctx: RequestContext, input: StoreCreditAddInput): Promise<StoreCredit> {
        const code = `store-credit-${input.value}-pts`;

        let createdVariant: ProductVariant | undefined = undefined;
        if (input.name && input.price) {
            const facetValue = await this.nppService.registerNppFacetValue(ctx, this.nppCode, 'Store Credit');
            const productOption = await this.nppService.registerNppProductOption(
                ctx,
                code,
                input.name.toLowerCase(),
            );
            const pid = await this.nppService.getRootNPPId(ctx);
            const variant = await this.productVariantService.create(ctx, [
                {
                    price: 1000,
                    productId: pid,
                    sku: 'STORE_CREDIT',
                    trackInventory: GlobalFlag.FALSE,
                    translations: [{ languageCode: LanguageCode.en, name: input.name }],
                    optionIds: [productOption.id],
                    facetValueIds: [facetValue.id],
                },
            ]);
            createdVariant = variant[0];
        }

        const storeCreditEntry = new StoreCredit({
            perUserLimit: input.perUserLimit,
            value: input.value || 0,
            variant: createdVariant,
        });

        return this.connection.getRepository(ctx, StoreCredit).save(storeCreditEntry);
    }

    async updateStoreCredit(ctx: RequestContext, input: StoreCreditUpdateInput): Promise<StoreCredit | null> {
        const storeCredit = await this.connection.getEntityOrThrow(ctx, StoreCredit, input.id);

        storeCredit.value = input.value ?? storeCredit.value;
        storeCredit.perUserLimit = input.perUserLimit ?? storeCredit.perUserLimit;

        if (input.name && storeCredit.variantId)
            await this.productVariantService.update(ctx, [
                {
                    id: storeCredit.variantId,
                    translations: [{ languageCode: LanguageCode.en, name: input.name }],
                },
            ]);

        return this.connection.getRepository(ctx, StoreCredit).save(storeCredit);
    }

    async deleteOne(ctx: RequestContext, id: ID) {
        const cred = await this.findOne(ctx, id, ['variant']);
        if (!cred)
            return {
                result: DeletionResult.NOT_DELETED,
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

        const resp = await this.connection.getRepository(ctx, StoreCredit).delete({ id });
        return resp.affected
            ? {
                result: DeletionResult.DELETED,
                message: 'Store Credit deleted successfully',
            }
            : { result: DeletionResult.NOT_DELETED, message: 'Something went wrong' };
    }

    async findAll(
        ctx: RequestContext,
        options?: StoreCreditListOptions,
        relations?: RelationPaths<StoreCredit>,
    ) {
        return this.listQueryBuilder
            .build(StoreCredit, options, {
                ctx,
                where: {
                    variant: { deletedAt: IsNull() },
                    ...(ctx.apiType == 'shop' ? { variantId: Not(IsNull()) } : {}),
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

    async findOne(ctx: RequestContext, id: ID, relations?: RelationPaths<StoreCredit>) {
        return this.connection.getRepository(ctx, StoreCredit).findOne({
            where: {
                id,
                variant: { deletedAt: IsNull() },
                ...(ctx.apiType == 'shop' ? { variantId: Not(IsNull()) } : {}),
            },
            relations,
        });
    }

    async addToOrder(ctx: RequestContext, creditId: ID, quantity: number, order: Order) {
        const cred = await this.findOne(ctx, creditId);
        if (!cred || !cred.variantId) throw new EntityNotFoundError('Store Credit', creditId);

        if (!order.customer) throw new Error('Order customer not set');

        const theCustomer = await this.customerService.findOne(ctx, order.customer.id, ['user']);
        if (!theCustomer) throw new EntityNotFoundError('Customer', order.customer.id);
        if (!theCustomer.user) throw new Error(`User not found for customer : ${theCustomer.id}`);

        if (theCustomer.user.customFields.customerAccountBalance >= cred.perUserLimit)
            throw new Error('User cannot buy this credit.');

        return this.orderService.addItemToOrder(ctx, order.id, cred.variantId, quantity);
    }

    async claim(ctx: RequestContext, key: string): Promise<ClaimResult> {
        if (!ctx.activeUserId) return { success: false, message: 'Not logged in' };

        const credit = await this.connection.getRepository(ctx, StoreCredit).findOne({ where: { key } });
        if (!credit || credit.userId) return { success: false, message: 'Invalid key' };

        const customer = await this.customerService.findOneByUserId(ctx, ctx.activeUserId);
        if (!customer) return { success: false, message: 'Invalid customer' };

        const user = await this.userService.getUserById(ctx, ctx.activeUserId);
        if (!user) return { success: false, message: 'Invalid user' };

        const currentBalance = user.customFields.customerAccountBalance || 0;
        const newBalance = currentBalance + credit.value;

        await this.connection.getRepository(ctx, User).update({ id: user.id }, {
            customFields: {
                customerAccountBalance: newBalance,
            }
        });
        credit.user = user;
        await this.connection.getRepository(ctx, StoreCredit).save(credit, { reload: false });

        return {
            success: true,
            message: 'Successfully claimed credit',
            addedCredit: credit.value,
            currentBalance: newBalance,
        };
    }


    async getSellerUser(ctx: RequestContext, sellerId: ID) {
        const theChannel = await this.connection.getRepository(ctx, Channel).findOne({
            where: {
                sellerId: sellerId,
            }
        });
        if (!theChannel) throw new EntityNotFoundError('Channel', 0);
        const theRole = await this.connection.getRepository(ctx, Role).findOne({
            where: {
                channels: {
                    id: theChannel.id,
                },
            },
            relations: ['channels']
        });
        if (!theRole) throw new EntityNotFoundError('Role', 0);
        const theUser = await this.connection.getRepository(ctx, User).findOne({
            where: {
                roles: {
                    id: theRole.id,
                },
                deletedAt: IsNull(),
            },
            relations: ['roles']
        });
        if (!theUser) throw new EntityNotFoundError('User', 0);
        return theUser;
    }

}
