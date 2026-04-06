import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Apartment } from '../../condominiums/entities/apartment.entity';
import { PickupCode } from './pickup-code.entity';

export enum PackageStatus {
  WAITING_PICKUP = 'WAITING_PICKUP',
  DELIVERED = 'DELIVERED',
  OVERDUE = 'OVERDUE',
}

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  received_by_user_id: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'received_by_user_id' })
  received_by_user: User;

  @Column({ type: 'uuid' })
  @Index('idx_packages_recipient_apartment')
  recipient_apartment_id: string;

  @ManyToOne(() => Apartment, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'recipient_apartment_id' })
  recipient_apartment: Apartment;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photo_url: string | null;

  @Column({
    type: 'enum',
    enum: PackageStatus,
    default: PackageStatus.WAITING_PICKUP,
  })
  @Index('idx_packages_status')
  status: PackageStatus;

  @Column({ type: 'date' })
  @Index('idx_packages_storage_deadline')
  storage_deadline: Date;

  @Column({ type: 'timestamp', nullable: true })
  overdue_alert_sent_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date | null;

  @OneToOne(() => PickupCode, (pickupCode) => pickupCode.package, {
    cascade: true,
    eager: true,
  })
  pickup_code: PickupCode;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
