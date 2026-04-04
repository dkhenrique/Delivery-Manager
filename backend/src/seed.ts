import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole, UserStatus } from './users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const existingAdmin = await usersService
    .findAll()
    .then((users) => users.find((u) => u.email === 'admin@condominium.com'));

  if (!existingAdmin) {
    console.log('Criando usuário Admin...');
    await usersService.create({
      name: 'Admin',
      email: 'admin@condominium.com',
      password: 'admin',
      cpf: '00000000000',
      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,
    });
    console.log(
      'Usuário Admin criado com sucesso! E-mail: admin@condominium.com | Senha: admin',
    );
  } else {
    console.log('Usuário Admin já existe no banco.');
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
