import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CondominiumsService } from './condominiums.service';
import { CreateApartmentDto } from './dto/create-condominium.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('apartments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
