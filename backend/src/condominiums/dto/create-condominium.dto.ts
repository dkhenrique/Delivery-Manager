import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';

export class CreateCondominiumDto {
  @ApiProperty({ example: 'Condomínio Jardim das Flores' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'Rua das Flores, 123 - Centro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;
}

export class CreateBlockDto {
  @ApiProperty({ example: 'uuid-do-condominio' })
  @IsUUID()
  @IsNotEmpty()
  condominium_id: string;

  @ApiProperty({ example: 'Bloco A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

export class CreateApartmentDto {
  @ApiProperty({ example: 'uuid-do-bloco' })
  @IsUUID()
  @IsNotEmpty()
  block_id: string;

  @ApiProperty({ example: '101' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  number: string;

  @ApiPropertyOptional({ example: 1, description: 'Andar (opcional)' })
  @IsInt()
  @IsOptional()
  floor?: number;
}
