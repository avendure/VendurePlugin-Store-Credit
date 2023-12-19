import { VendureEntity, ID, DeepPartial, Order, Seller } from '@vendure/core';
import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { EntityId } from '@vendure/core/dist/entity/entity-id.decorator';

@Entity()
export class CreditExchange extends VendureEntity {
    constructor(input?: DeepPartial<CreditExchange>) {
        super(input);
    }

    @Column({ default: 0 })
    amount: number;

    @Column('varchar')
    status: string;

    @OneToOne(() => Order, { eager: true, nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @EntityId({ nullable: true })
    orderId: ID | null;

    @ManyToOne(() => Seller, {
        eager: true,
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'sellerId' })
    seller: Seller;

    @EntityId({ nullable: false })
    sellerId: ID;
}
