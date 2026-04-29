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
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import { passwordResetTemplate } from '../mail/templates/password-reset.template';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
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
    // Verificar e-mail duplicado
    const existingByEmail = await this.usersService.findByEmail(
      registerDto.email,
    );
    if (existingByEmail) {
      throw new BadRequestException(
        'E-mail já está em uso. Utilize outro endereço ou faça login na conta existente.',
      );
    }

    // Verificar CPF duplicado (sanitiza antes de consultar)
    const cpfNormalized = registerDto.cpf.replace(/\D/g, '');
    const existingByCpf = await this.usersService.findByCpf(cpfNormalized);
    if (existingByCpf) {
      throw new BadRequestException(
        'CPF já está cadastrado no sistema. Utilize outro CPF ou faça login na conta existente.',
      );
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

  async forgotPassword(email: string): Promise<void> {
    // Security: never reveal whether the email exists
    const user = await this.usersService.findByEmail(email);
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersService.setResetToken(user.id, token, expires);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetUrl = `${frontendUrl}/redefinir-senha?token=${token}`;

    await this.mailService.sendMail(
      user.email,
      '🔑 Recuperação de senha — Delivery Manager',
      passwordResetTemplate({
        userName: user.name,
        resetUrl,
        expiresInMinutes: 60,
      }),
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByResetToken(token);

    if (
      !user ||
      !user.reset_password_expires ||
      user.reset_password_expires < new Date()
    ) {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    await this.usersService.updatePassword(user.id, newPassword);
  }
}
