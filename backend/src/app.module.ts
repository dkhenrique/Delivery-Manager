import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { CondominiumsModule } from './condominiums/condominiums.module';
import { Condominium } from './condominiums/entities/condominium.entity';
import { Block } from './condominiums/entities/block.entity';
import { Apartment } from './condominiums/entities/apartment.entity';
import { AuthModule } from './auth/auth.module';

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
      entities: [User, Condominium, Block, Apartment],
      synchronize: true, // DEV only — usar migrations em produção
    }),
    UsersModule,
    CondominiumsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
