import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CondominiumsService } from './condominiums.service';
import { CreateApartmentDto } from './dto/create-condominium.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('apartments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar um novo apartamento (Admin only)' })
  create(@Body() dto: CreateApartmentDto) {
    return this.condominiumsService.createApartment(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os apartamentos' })
  findAll() {
    return this.condominiumsService.findAllApartments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar apartamento por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.condominiumsService.findOneApartment(id);
  }
}
