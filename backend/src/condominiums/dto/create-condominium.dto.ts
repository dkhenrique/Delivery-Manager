import { ApiProperty } from '@nestjs/swagger';

export class CreateCondominiumDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;
}

export class CreateBlockDto {
  @ApiProperty()
  condominium_id: string;

  @ApiProperty()
  name: string;
}

export class CreateApartmentDto {
  @ApiProperty()
  block_id: string;

  @ApiProperty()
  number: string;
}
