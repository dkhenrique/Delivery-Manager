import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CondominiumsService } from './condominiums.service';
import { CreateApartmentDto } from './dto/create-condominium.dto';

@ApiTags('apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Apartment for a Block' })
  create(@Body() dto: CreateApartmentDto) {
    return this.condominiumsService.createApartment(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all Apartments' })
  findAll() {
    return this.condominiumsService.findAllApartments();
  }
}
