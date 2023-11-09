import { VendureEntity, DeepPartial } from '@vendure/core';
import { Entity, Column, Unique } from 'typeorm';

@Entity()
@Unique(['key'])
export class StoreCredit extends VendureEntity {
  constructor(input?: DeepPartial<StoreCredit>) {
    super(input);
  }

  @Column()
  key: string;

  @Column({ default: 0 })
  value: number;

  @Column({ nullable: true })
  customerId: string;

  @Column({ default: false })
  isClaimed: boolean;
}
