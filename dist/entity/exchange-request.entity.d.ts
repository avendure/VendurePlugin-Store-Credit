import { VendureEntity, ID, DeepPartial, Order, Seller } from '@vendure/core';
export declare class CreditExchange extends VendureEntity {
    constructor(input?: DeepPartial<CreditExchange>);
    amount: number;
    status: string;
    order: Order;
    orderId: ID | null;
    seller: Seller;
    sellerId: ID;
}
