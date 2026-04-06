import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class ConfirmPickupDto {
  @ApiProperty({
    example: '482917',
    description: 'Código de retirada de 6 dígitos numéricos',
  })
  @IsString()
  @Length(6, 6, { message: 'O código deve ter exatamente 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'O código deve conter apenas números' })
  code: string;
}
