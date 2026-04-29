import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';
import { PickupCode } from './entities/pickup-code.entity';
import { User } from '../users/entities/user.entity';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { CondominiumsModule } from '../condominiums/condominiums.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Package, PickupCode, User]),
    CondominiumsModule, // para acessar o Apartment repository
    NotificationsModule,
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
