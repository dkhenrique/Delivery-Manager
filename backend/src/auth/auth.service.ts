import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/auth.dto';
import { UserRole, UserStatus, User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      return null;
    }

    // RF-01: Usuário com cadastro REJECTED não pode fazer login
    if (user.status === UserStatus.REJECTED) {
      throw new UnauthorizedException(
        'Seu cadastro foi rejeitado. Entre em contato com o síndico.',
      );
    }

    return user;
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      status: user.status,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('E-mail já está em uso');
    }

    return this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
      cpf: registerDto.cpf,
      apartment_id: registerDto.apartment_id,
      role: UserRole.RESIDENT,
      status: UserStatus.PENDING,
    });
  }
}
