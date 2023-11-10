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
const credits_admin_types_1 = require("../types/credits-admin-types");
let StoreCreditService = class StoreCreditService {
    constructor(connection, listQueryBuilder, customerService, sellerService, channelService, userService, administratorService) {
        this.connection = connection;
        this.listQueryBuilder = listQueryBuilder;
        this.customerService = customerService;
        this.sellerService = sellerService;
        this.channelService = channelService;
        this.userService = userService;
        this.administratorService = administratorService;
    }
    async claim(ctx, key) {
        const userId = ctx.activeUserId;
        if (!userId) {
            core_1.Logger.error('Not a valid User');
            throw new Error('Not a valid User');
        }
        const storeCredit = await this.connection
            .getRepository(ctx, store_credit_entity_1.StoreCredit)
            .findOne({
            where: {
                key,
                isClaimed: false,
            },
        });
        if (!storeCredit) {
            core_1.Logger.error('Invalid store credit key or credit already claimed.');
            throw new Error('Invalid store credit key or credit already claimed.');
        }
        const customer = await this.customerService.findOneByUserId(ctx, userId);
        if (!customer) {
            core_1.Logger.error('Invalid customer');
            throw new Error('Invalid customer');
        }
        const customFields = customer.customFields;
        const accountBalance = customFields.accountBalance || 0;
        const updatedCustomer = await this.customerService.update(ctx, {
            id: customer.id,
            customFields: {
                ...customFields,
                accountBalance: storeCredit.value + accountBalance,
            },
        });
        if (updatedCustomer) {
            storeCredit.isClaimed = true;
            storeCredit.customerId = updatedCustomer.id.toString();
            await this.connection.getRepository(ctx, store_credit_entity_1.StoreCredit).save(storeCredit);
        }
        return storeCredit;
    }
    async createStoreCredit(ctx, input) {
        const storeCreditEntry = new store_credit_entity_1.StoreCredit({
            key: input.key,
            value: input.value || 0,
        });
        core_1.Logger.info('Store Credit Created');
        return this.connection
            .getRepository(ctx, store_credit_entity_1.StoreCredit)
            .save(storeCreditEntry);
    }
    async updateStoreCredit(ctx, input) {
        const storeCredit = await this.connection.getEntityOrThrow(ctx, store_credit_entity_1.StoreCredit, input.id);
        if (!storeCredit) {
            throw new Error(`StoreCredit with ID ${input.id} not found.`);
        }
        storeCredit.key = input.key || storeCredit.key;
        if (input && input.value !== undefined && input.value >= 0) {
            storeCredit.value = input.value;
        }
        return this.connection.getRepository(ctx, store_credit_entity_1.StoreCredit).save(storeCredit);
    }
    async deleteStoreCredit(ctx, id) {
        const deleteResult = await this.connection
            .getRepository(ctx, store_credit_entity_1.StoreCredit)
            .delete(id);
        if (deleteResult.affected === 0) {
            throw new common_1.NotFoundException('Store Credit not found.');
        }
        core_1.Logger.info('Store Credit Deleted');
        return {
            message: 'Store Credit successfully deleted.',
            result: credits_admin_types_1.DeletionResult.DELETED,
        };
    }
    async getAllStoreCredit(options) {
        return await this.listQueryBuilder
            .build(store_credit_entity_1.StoreCredit, options)
            .getManyAndCount()
            .then(([storeCredits, totalItems]) => {
            return {
                items: storeCredits,
                totalItems,
            };
        });
    }
    async getStoreCreditById(ctx, id) {
        const storeCredit = await this.connection
            .getRepository(ctx, store_credit_entity_1.StoreCredit)
            .findOne({
            where: { id },
        });
        return storeCredit;
    }
    async getCustomerStoreCredits(ctx) {
        const userId = ctx.activeUserId;
        if (!userId) {
            throw new Error('Not a valid User');
        }
        const customer = await this.customerService.findOneByUserId(ctx, userId);
        if (!customer) {
            throw new Error('Invalid customer');
        }
        const allcredits = await this.connection
            .getRepository(ctx, store_credit_entity_1.StoreCredit)
            .find({
            where: {
                customerId: customer.id.toString(),
            },
        });
        return allcredits;
    }
    async getStoreCreditByCustomerId(ctx, input) {
        const userId = ctx.activeUserId;
        if (!userId) {
            throw new Error('Not a valid User');
        }
        const customer = await this.customerService.findOneByUserId(ctx, userId);
        if (!customer || customer.id !== input.customerId) {
            throw new Error('Invalid customer');
        }
        const credit = await this.connection
            .getRepository(ctx, store_credit_entity_1.StoreCredit)
            .findOne({
            where: {
                id: input.id,
                customerId: String(input.customerId),
            },
        });
        if (!credit) {
            throw new Error('Invalid store credit');
        }
        return credit;
    }
    // Being used in admin ui
    async transferCreditfromSellerToUser(ctx, value, sellerId) {
        const seller = await this.connection.getRepository(ctx, core_1.Seller).findOne({
            where: {
                id: sellerId,
            },
            relations: ['customFields', 'customFields.user'],
        });
        if (!seller) {
            throw new Error('Invalid seller');
        }
        const sellerCustomFields = seller.customFields;
        const user = seller.customFields.user;
        if (!user) {
            throw new Error('Please set your User.');
        }
        const getcustomer = await this.connection
            .getRepository(ctx, core_1.Customer)
            .findOne({
            where: {
                emailAddress: user.identifier,
            },
        });
        if (!getcustomer) {
            throw new Error('Invalid customer');
        }
        const customerCustomFields = getcustomer.customFields;
        // transaction
        if (sellerCustomFields.accountBalance < value) {
            throw new Error('Insufficient balance');
        }
        const updateSeller = await this.sellerService.update(ctx, {
            id: sellerId,
            customFields: {
                ...sellerCustomFields,
                accountBalance: sellerCustomFields.accountBalance - Number(value),
            },
        });
        if (!updateSeller) {
            throw new Error('Invalid seller');
        }
        const updateCustomer = await this.customerService.update(ctx, {
            id: getcustomer.id,
            customFields: {
                ...customerCustomFields,
                accountBalance: customerCustomFields.accountBalance + value,
            },
        });
        if (!updateCustomer) {
            await this.sellerService.update(ctx, {
                id: sellerId,
                customFields: {
                    ...sellerCustomFields,
                    accountBalance: sellerCustomFields.accountBalance + Number(value),
                },
            });
            throw new Error('Invalid customer');
        }
        return true;
    }
    // if want to transfer to customer with same email as seller replace with this in resolver.
    async transferCreditfromSellerToCustomerWithSameEmail(ctx, value, sellerId) {
        var _a;
        const seller = await this.connection.getRepository(ctx, core_1.Seller).findOne({
            where: {
                id: sellerId,
            },
            relations: ['customFields', 'customFields.user'],
        });
        if (!seller) {
            throw new Error('Invalid seller');
        }
        const sellerEmail = (_a = seller.customFields.user) === null || _a === void 0 ? void 0 : _a.identifier;
        const customerWithSameEmail = await this.connection
            .getRepository(ctx, core_1.Customer)
            .findOne({
            where: {
                emailAddress: sellerEmail,
            },
        });
        if (!customerWithSameEmail) {
            throw new Error('Customer with same email as seller not found');
        }
        const sellerCustomFields = seller.customFields;
        const getcustomer = customerWithSameEmail;
        const customerCustomFields = getcustomer.customFields;
        // transaction
        if (sellerCustomFields.accountBalance < value) {
            throw new Error('Insufficient balance');
        }
        const updateSeller = await this.sellerService.update(ctx, {
            id: sellerId,
            customFields: {
                ...sellerCustomFields,
                accountBalance: sellerCustomFields.accountBalance - Number(value),
            },
        });
        if (!updateSeller) {
            throw new Error('Invalid seller');
        }
        const updateCustomer = await this.customerService.update(ctx, {
            id: getcustomer.id,
            customFields: {
                ...customerCustomFields,
                accountBalance: customerCustomFields.accountBalance + value,
            },
        });
        if (!updateCustomer) {
            const updateSeller = await this.sellerService.update(ctx, {
                id: sellerId,
                customFields: {
                    ...sellerCustomFields,
                    accountBalance: sellerCustomFields.accountBalance + Number(value),
                },
            });
            throw new Error('Invalid customer');
        }
        core_1.Logger.info('Store Credit Transfered');
        return {
            customerAccountBalance: updateCustomer.customFields.accountBalance,
            sellerAccountBalance: updateSeller.customFields.accountBalance,
        };
    }
    async getStoreCreditForSameCustomer(ctx, id, sellerId) {
        const user = await this.userService.getUserById(ctx, ctx.activeUserId);
        if (!user) {
            throw new Error('Invalid user');
        }
        console.log('user: ', user);
        const getcustomer = await this.connection
            .getRepository(ctx, core_1.Customer)
            .findOne({
            where: {
                emailAddress: user.identifier,
            },
        });
        if (!getcustomer) {
            throw new Error('Invalid customer');
        }
        console.log('getcustomer: ', getcustomer);
        const storeCredit = await this.connection
            .getRepository(ctx, store_credit_entity_1.StoreCredit)
            .find({
            where: {
                isClaimed: true,
                customerId: getcustomer.id.toString(),
            },
        });
        if (!storeCredit) {
            throw new Error('Invalid store credit');
        }
        return storeCredit;
    }
    async getStoreCreditsForSameCustomerWithSellerID(ctx, sellerId) {
        const user = await this.userService.getUserById(ctx, ctx.activeUserId);
        if (!user) {
            throw new Error('Invalid user');
        }
        console.log('user: ', user);
        const getcustomer = await this.connection
            .getRepository(ctx, core_1.Customer)
            .findOne({
            where: {
                emailAddress: user.identifier,
            },
        });
        if (!getcustomer) {
            throw new Error('Invalid customer');
        }
        console.log('getcustomer: ', getcustomer);
        const storeCredit = await this.connection
            .getRepository(ctx, store_credit_entity_1.StoreCredit)
            .find({
            where: {
                isClaimed: true,
                customerId: getcustomer.id.toString(),
            },
        });
        if (!storeCredit) {
            throw new Error('Invalid store credit');
        }
        return storeCredit;
    }
    // being used in admin ui
    async getSellerANDCustomerStoreCredits(ctx, sellerId) {
        var _a;
        const seller = await this.connection.getRepository(ctx, core_1.Seller).findOne({
            where: {
                id: sellerId,
            },
            relations: ['customFields', 'customFields.user'],
        });
        if (!seller) {
            throw new Error('Invalid seller');
        }
        const sellerEmail = (_a = seller.customFields.user) === null || _a === void 0 ? void 0 : _a.identifier;
        if (!sellerEmail) {
            throw new Error('Please set your User.');
        }
        // console.log('sellerEmail: ', sellerEmail);
        const customerWithSameEmail = await this.connection
            .getRepository(ctx, core_1.Customer)
            .findOne({
            where: {
                emailAddress: sellerEmail,
            },
        });
        if (!customerWithSameEmail) {
            throw new Error('Customer with same email as seller not found');
        }
        // console.log('customerWithSameEmail: ', customerWithSameEmail);
        const sellerCustomFields = seller.customFields;
        const getcustomer = customerWithSameEmail;
        // console.log('getcustomer: ', getcustomer);
        const customerCustomFields = getcustomer.customFields;
        const balance = {
            customerAccountBalance: customerCustomFields.accountBalance,
            sellerAccountBalance: sellerCustomFields.accountBalance,
        };
        // console.log('balance: ', balance);
        return balance;
    }
};
StoreCreditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.TransactionalConnection,
        core_1.ListQueryBuilder,
        core_1.CustomerService,
        core_1.SellerService,
        core_1.ChannelService,
        core_1.UserService,
        core_1.AdministratorService])
], StoreCreditService);
exports.StoreCreditService = StoreCreditService;
