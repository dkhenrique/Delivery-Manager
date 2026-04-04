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
import { CreateCondominiumDto } from './dto/create-condominium.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('condominiums')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('condominiums')
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar um novo condomínio (Admin only)' })
  create(@Body() dto: CreateCondominiumDto) {
    return this.condominiumsService.createCondominium(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os condomínios' })
  findAll() {
    return this.condominiumsService.findAllCondominiums();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar condomínio por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.condominiumsService.findOneCondominium(id);
  }
}
