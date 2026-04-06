import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({
    example: 'uuid-do-apartamento-destinatario',
    description: 'ID do apartamento do dono da encomenda',
  })
  @IsUUID()
  @IsNotEmpty()
  recipient_apartment_id: string;

  @ApiPropertyOptional({
    example: 'Caixa grande dos Correios, etiqueta azul',
    description: 'Descrição opcional da encomenda (máx 500 caracteres)',
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 7,
    description: 'Prazo de guarda em dias (mín 1, máx 30)',
  })
  @IsInt()
  @Min(1)
  @Max(30)
  storage_deadline_days: number;
}
