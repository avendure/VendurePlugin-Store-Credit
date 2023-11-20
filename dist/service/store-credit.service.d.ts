import { TransactionalConnection, RequestContext, ListQueryBuilder, ID, CustomerService, SellerService, ChannelService, UserService, AdministratorService } from "@vendure/core";
import { StoreCredit } from "../entity/store-credit.entity";
import { DeletionResult, StoreCreditAddInput, StoreCreditListOptions, StoreCreditUpdateInput } from "../types/credits-admin-types";
export declare class StoreCreditService {
    private connection;
    private listQueryBuilder;
    private customerService;
    private sellerService;
    private channelService;
    private userService;
    private administratorService;
    constructor(connection: TransactionalConnection, listQueryBuilder: ListQueryBuilder, customerService: CustomerService, sellerService: SellerService, channelService: ChannelService, userService: UserService, administratorService: AdministratorService);
    claim(ctx: RequestContext, key: string): Promise<StoreCredit | null>;
    createStoreCredit(ctx: RequestContext, input: StoreCreditAddInput): Promise<StoreCredit>;
    updateStoreCredit(ctx: RequestContext, input: StoreCreditUpdateInput): Promise<StoreCredit | null>;
    deleteStoreCredit(ctx: RequestContext, id: string): Promise<{
        message: string;
        result: DeletionResult;
    }>;
    getAllStoreCredit(options?: StoreCreditListOptions): Promise<{
        items: StoreCredit[];
        totalItems: number;
    }>;
    getStoreCreditById(ctx: RequestContext, id: ID): Promise<StoreCredit | null>;
    getCustomerStoreCredits(ctx: RequestContext): Promise<StoreCredit[]>;
    getStoreCreditByCustomerId(ctx: RequestContext, input: {
        id: ID;
        customerId: ID;
    }): Promise<StoreCredit>;
    transferCreditfromSellerToUser(ctx: RequestContext, value: Number, sellerId: ID): Promise<boolean>;
    transferCreditfromSellerToCustomerWithSameEmail(ctx: RequestContext, value: Number, sellerId: ID): Promise<{
        customerAccountBalance: number;
        sellerAccountBalance: number;
    }>;
    getStoreCreditForSameCustomer(ctx: RequestContext, id?: ID, sellerId?: ID): Promise<StoreCredit[]>;
    getStoreCreditsForSameCustomerWithSellerID(ctx: RequestContext, sellerId: ID): Promise<StoreCredit[]>;
    getSellerANDCustomerStoreCredits(ctx: RequestContext, sellerId: ID): Promise<{
        customerAccountBalance: any;
        sellerAccountBalance: any;
    }>;
}
