import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Block } from './block.entity';
import { User } from '../../users/entities/user.entity';

@Entity('apartments')
export class Apartment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  block_id: string;

  @ManyToOne(() => Block, (block) => block.apartments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'block_id' })
  block: Block;

  @Column({ type: 'varchar', length: 20 })
  number: string;

  @OneToMany(() => User, (user) => user.apartment)
  users: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
