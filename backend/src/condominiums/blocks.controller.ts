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
import { CreateBlockDto } from './dto/create-condominium.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('blocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('blocks')
export class BlocksController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar um novo bloco (Admin only)' })
  create(@Body() dto: CreateBlockDto) {
    return this.condominiumsService.createBlock(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os blocos' })
  findAll() {
    return this.condominiumsService.findAllBlocks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar bloco por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.condominiumsService.findOneBlock(id);
  }
}
