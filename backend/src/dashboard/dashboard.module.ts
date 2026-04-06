import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Package } from '../packages/entities/package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Package])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
