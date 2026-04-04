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
import { Condominium } from './condominium.entity';
import { Apartment } from './apartment.entity';

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  condominium_id: string;

  @ManyToOne(() => Condominium, (condominium) => condominium.blocks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'condominium_id' })
  condominium: Condominium;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @OneToMany(() => Apartment, (apartment) => apartment.block, {
    cascade: ['remove'],
  })
  apartments: Apartment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
