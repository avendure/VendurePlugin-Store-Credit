import { Injectable, NotFoundException } from "@nestjs/common";
import {
  TransactionalConnection,
  RequestContext,
  ListQueryBuilder,
  ID,
  CustomerService,
  SellerService,
  ChannelService,
  UserService,
  AdministratorService,
  Customer,
  Seller,
  Administrator,
  User,
  Channel,
  Logger,
} from "@vendure/core";
import { StoreCredit } from "../entity/store-credit.entity";

import {
  DeletionResult,
  StoreCreditAddInput,
  StoreCreditListOptions,
  StoreCreditUpdateInput,
} from "../types/credits-admin-types";

@Injectable()
export class StoreCreditService {
  constructor(
    private connection: TransactionalConnection,
    private listQueryBuilder: ListQueryBuilder,
    private customerService: CustomerService,
    private sellerService: SellerService,
    private channelService: ChannelService,
    private userService: UserService,
    private administratorService: AdministratorService
  ) {}

  async claim(ctx: RequestContext, key: string): Promise<StoreCredit | null> {
    const userId = ctx.activeUserId;
    if (!userId) {
      Logger.error("Not a valid User");
      throw new Error("Not a valid User");
    }
    const storeCredit = await this.connection
      .getRepository(ctx, StoreCredit)
      .findOne({
        where: {
          key,
          isClaimed: false,
        },
      });

    if (!storeCredit) {
      Logger.error("Invalid store credit key or credit already claimed.");
      throw new Error("Invalid store credit key or credit already claimed.");
    }

    const customer = await this.customerService.findOneByUserId(ctx, userId);

    if (!customer) {
      Logger.error("Invalid customer");
      throw new Error("Invalid customer");
    }

    const customFields = customer.customFields as any;
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
      await this.connection.getRepository(ctx, StoreCredit).save(storeCredit);
    }

    return storeCredit;
  }

  async createStoreCredit(
    ctx: RequestContext,
    input: StoreCreditAddInput
  ): Promise<StoreCredit> {
    const storeCreditEntry = new StoreCredit({
      key: input.key,
      value: input.value || 0,
    });
    Logger.info("Store Credit Created");
    return this.connection
      .getRepository(ctx, StoreCredit)
      .save(storeCreditEntry);
  }

  async updateStoreCredit(
    ctx: RequestContext,
    input: StoreCreditUpdateInput
  ): Promise<StoreCredit | null> {
    const storeCredit = await this.connection.getEntityOrThrow(
      ctx,
      StoreCredit,
      input.id
    );
    if (!storeCredit) {
      throw new Error(`StoreCredit with ID ${input.id} not found.`);
    }

    storeCredit.key = input.key || storeCredit.key;
    if (input && input.value !== undefined && input.value >= 0) {
      storeCredit.value = input.value;
    }

    return this.connection.getRepository(ctx, StoreCredit).save(storeCredit);
  }

  async deleteStoreCredit(ctx: RequestContext, id: string) {
    const deleteResult = await this.connection
      .getRepository(ctx, StoreCredit)
      .delete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException("Store Credit not found.");
    }
    Logger.info("Store Credit Deleted");
    return {
      message: "Store Credit successfully deleted.",
      result: DeletionResult.DELETED,
    };
  }

  async getAllStoreCredit(options?: StoreCreditListOptions) {
    return await this.listQueryBuilder
      .build(StoreCredit, options)
      .getManyAndCount()
      .then(([storeCredits, totalItems]) => {
        return {
          items: storeCredits,
          totalItems,
        };
      });
  }

  async getStoreCreditById(
    ctx: RequestContext,
    id: ID
  ): Promise<StoreCredit | null> {
    const storeCredit = await this.connection
      .getRepository(ctx, StoreCredit)
      .findOne({
        where: { id },
      });
    return storeCredit;
  }

  async getCustomerStoreCredits(ctx: RequestContext) {
    const userId = ctx.activeUserId;
    if (!userId) {
      throw new Error("Not a valid User");
    }
    const customer = await this.customerService.findOneByUserId(ctx, userId);
    if (!customer) {
      throw new Error("Invalid customer");
    }
    const allcredits = await this.connection
      .getRepository(ctx, StoreCredit)
      .find({
        where: {
          customerId: customer.id.toString(),
        },
      });

    return allcredits as StoreCredit[];
  }

  async getStoreCreditByCustomerId(
    ctx: RequestContext,
    input: { id: ID; customerId: ID }
  ) {
    const userId = ctx.activeUserId;
    if (!userId) {
      throw new Error("Not a valid User");
    }
    const customer = await this.customerService.findOneByUserId(ctx, userId);

    if (!customer || customer.id !== input.customerId) {
      throw new Error("Invalid customer");
    }
    const credit = await this.connection
      .getRepository(ctx, StoreCredit)
      .findOne({
        where: {
          id: input.id,
          customerId: String(input.customerId),
        },
      });
    if (!credit) {
      throw new Error("Invalid store credit");
    }
    return credit;
  }

  // Being used in admin ui
  async transferCreditfromSellerToUser(
    ctx: RequestContext,
    value: Number,
    sellerId: ID
  ) {
    const seller = await this.connection.getRepository(ctx, Seller).findOne({
      where: {
        id: sellerId,
      },
      relations: ["customFields", "customFields.user"],
    });
    if (!seller) {
      throw new Error("Invalid seller");
    }
    const sellerCustomFields = seller.customFields as any;
    const user = seller.customFields.user;
    if (!user) {
      throw new Error("Please set your User.");
    }

    const getcustomer = await this.connection
      .getRepository(ctx, Customer)
      .findOne({
        where: {
          emailAddress: user.identifier,
        },
      });
    if (!getcustomer) {
      throw new Error("Invalid customer");
    }
    const customerCustomFields = getcustomer.customFields as any;

    // transaction
    if (sellerCustomFields.accountBalance < value) {
      throw new Error("Insufficient balance");
    }
    const updateSeller = await this.sellerService.update(ctx, {
      id: sellerId,
      customFields: {
        ...sellerCustomFields,
        accountBalance: sellerCustomFields.accountBalance - Number(value),
      },
    });
    if (!updateSeller) {
      throw new Error("Invalid seller");
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
      throw new Error("Invalid customer");
    }
    return true;
  }

  // if want to transfer to customer with same email as seller replace with this in resolver.
  async transferCreditfromSellerToCustomerWithSameEmail(
    ctx: RequestContext,
    value: Number,
    sellerId: ID
  ) {
    const seller = await this.connection.getRepository(ctx, Seller).findOne({
      where: {
        id: sellerId,
      },
      relations: ["customFields", "customFields.user"],
    });
    if (!seller) {
      throw new Error("Invalid seller");
    }
    const sellerEmail = seller.customFields.user?.identifier;
    const customerWithSameEmail = await this.connection
      .getRepository(ctx, Customer)
      .findOne({
        where: {
          emailAddress: sellerEmail,
        },
      });
    if (!customerWithSameEmail) {
      throw new Error("Customer with same email as seller not found");
    }
    const sellerCustomFields = seller.customFields as any;
    const getcustomer = customerWithSameEmail;
    const customerCustomFields = getcustomer.customFields as any;

    // transaction
    if (sellerCustomFields.accountBalance < value) {
      throw new Error("Insufficient balance");
    }
    const updateSeller = await this.sellerService.update(ctx, {
      id: sellerId,
      customFields: {
        ...sellerCustomFields,
        accountBalance: sellerCustomFields.accountBalance - Number(value),
      },
    });
    if (!updateSeller) {
      throw new Error("Invalid seller");
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
      throw new Error("Invalid customer");
    }
    Logger.info("Store Credit Transfered");
    return {
      customerAccountBalance: updateCustomer.customFields.accountBalance,
      sellerAccountBalance: updateSeller.customFields.accountBalance,
    };
  }

  async getStoreCreditForSameCustomer(
    ctx: RequestContext,
    id?: ID,
    sellerId?: ID
  ) {
    const user = await this.userService.getUserById(
      ctx,
      ctx.activeUserId as ID
    );
    if (!user) {
      throw new Error("Invalid user");
    }
    console.log("user: ", user);

    const getcustomer = await this.connection
      .getRepository(ctx, Customer)
      .findOne({
        where: {
          emailAddress: user.identifier,
        },
      });
    if (!getcustomer) {
      throw new Error("Invalid customer");
    }
    console.log("getcustomer: ", getcustomer);
    const storeCredit = await this.connection
      .getRepository(ctx, StoreCredit)
      .find({
        where: {
          isClaimed: true,
          customerId: getcustomer.id.toString(),
        },
      });
    if (!storeCredit) {
      throw new Error("Invalid store credit");
    }
    return storeCredit;
  }
  async getStoreCreditsForSameCustomerWithSellerID(
    ctx: RequestContext,
    sellerId: ID
  ) {
    const user = await this.userService.getUserById(
      ctx,
      ctx.activeUserId as ID
    );
    if (!user) {
      throw new Error("Invalid user");
    }
    console.log("user: ", user);

    const getcustomer = await this.connection
      .getRepository(ctx, Customer)
      .findOne({
        where: {
          emailAddress: user.identifier,
        },
      });
    if (!getcustomer) {
      throw new Error("Invalid customer");
    }
    console.log("getcustomer: ", getcustomer);
    const storeCredit = await this.connection
      .getRepository(ctx, StoreCredit)
      .find({
        where: {
          isClaimed: true,
          customerId: getcustomer.id.toString(),
        },
      });
    if (!storeCredit) {
      throw new Error("Invalid store credit");
    }
    return storeCredit;
  }

  // being used in admin ui
  async getSellerANDCustomerStoreCredits(ctx: RequestContext, sellerId: ID) {
    const seller = await this.connection.getRepository(ctx, Seller).findOne({
      where: {
        id: sellerId,
      },
      relations: ["customFields", "customFields.user"],
    });
    if (!seller) {
      throw new Error("Invalid seller");
    }
    const sellerEmail = seller.customFields.user?.identifier;
    if (!sellerEmail) {
      throw new Error("Please set your User.");
    }
    console.log("sellerEmail: ", sellerEmail);

    const customerWithSameEmail = await this.connection
      .getRepository(ctx, Customer)
      .findOne({
        where: {
          emailAddress: sellerEmail,
        },
      });
    if (!customerWithSameEmail) {
      throw new Error("Customer with same email as seller not found");
    }
    // console.log('customerWithSameEmail: ', customerWithSameEmail);

    const sellerCustomFields = seller.customFields as any;
    const getcustomer = customerWithSameEmail;
    // console.log('getcustomer: ', getcustomer);
    const customerCustomFields = getcustomer.customFields as any;
    const balance = {
      customerAccountBalance: customerCustomFields.accountBalance,
      sellerAccountBalance: sellerCustomFields.accountBalance,
    };
    // console.log('balance: ', balance);

    return balance;
  }
}
