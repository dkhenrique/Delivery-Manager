import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CondominiumsService } from './condominiums.service';
import { CreateBlockDto } from './dto/create-condominium.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('blocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('blocks')
export class BlocksController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Block for a Condominium' })
  create(@Body() dto: CreateBlockDto) {
    return this.condominiumsService.createBlock(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all Blocks' })
  findAll() {
    return this.condominiumsService.findAllBlocks();
  }
}
