import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Condominium } from './entities/condominium.entity';
import { Block } from './entities/block.entity';
import { Apartment } from './entities/apartment.entity';
import { CondominiumsController } from './condominiums.controller';
import { BlocksController } from './blocks.controller';
import { ApartmentsController } from './apartments.controller';
import { CondominiumsService } from './condominiums.service';

@Module({
  imports: [TypeOrmModule.forFeature([Condominium, Block, Apartment])],
  controllers: [CondominiumsController, BlocksController, ApartmentsController],
  providers: [CondominiumsService],
  exports: [TypeOrmModule],
})
export class CondominiumsModule {}
