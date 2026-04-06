import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';
import { PickupCode } from './entities/pickup-code.entity';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { CondominiumsModule } from '../condominiums/condominiums.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Package, PickupCode]),
    CondominiumsModule, // para acessar o Apartment repository
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
