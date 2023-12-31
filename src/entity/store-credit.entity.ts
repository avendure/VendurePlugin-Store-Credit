import { VendureEntity, ID, ProductVariant, DeepPartial, Customer } from '@vendure/core';
import { Entity, Column, Generated, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { EntityId } from '@vendure/core/dist/entity/entity-id.decorator';

@Entity()
export class StoreCredit extends VendureEntity {
    constructor(input?: DeepPartial<StoreCredit>) {
        super(input);
    }

    @OneToOne(() => ProductVariant, {
        eager: true,
        nullable: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'variantId' })
    variant: ProductVariant | null;

    @EntityId({ nullable: true })
    variantId: ID | null;

    @Column({ default: 0 })
    perUserLimit: number;

    @Column({ nullable: false })
    value: number;

    @Column()
    @Generated('uuid')
    key: string;

    @ManyToOne(() => Customer, {
        eager: true,
        nullable: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'customerId' })
    customer: Customer | null;

    @EntityId({ nullable: true })
    customerId: ID | null;
}
