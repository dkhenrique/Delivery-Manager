import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserStatus } from '../entities/user.entity';

/**
 * DTO para atualização de usuário.
 * Não expõe `role` — promoção/rebaixamento de papel deve ser feita via endpoint específico.
 * Campos sensíveis (role, status) são controlados por endpoints dedicados.
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'João da Silva' })
  @IsString()
  @MaxLength(150)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'joao@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @IsString()
  @MaxLength(14)
  @IsOptional()
  cpf?: string;

  @ApiPropertyOptional({ example: 'uuid-do-apartamento' })
  @IsUUID()
  @IsOptional()
  apartment_id?: string;
}

/**
 * DTO interno para operações administrativas de status.
 * Usado pelos endpoints /approve e /reject — não exposto na API pública.
 */
export class UpdateUserStatusDto {
  status: UserStatus;
  rejection_reason?: string;
}
