import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { CondominiumsModule } from './condominiums/condominiums.module';
import { Condominium } from './condominiums/entities/condominium.entity';
import { Block } from './condominiums/entities/block.entity';
import { Apartment } from './condominiums/entities/apartment.entity';
import { AuthModule } from './auth/auth.module';
import { PackagesModule } from './packages/packages.module';
import { Package } from './packages/entities/package.entity';
import { PickupCode } from './packages/entities/pickup-code.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'devuser',
      password: process.env.DB_PASSWORD || 'devpassword',
      database: process.env.DB_NAME || 'delivery_manager',
      entities: [User, Condominium, Block, Apartment, Package, PickupCode],
      synchronize: true, // DEV only — usar migrations em produção
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    UsersModule,
    CondominiumsModule,
    AuthModule,
    PackagesModule,
    ScheduleModule.forRoot(),
    NotificationsModule,
    DashboardModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
