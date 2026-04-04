import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CondominiumsService } from './condominiums.service';
import { CreateCondominiumDto } from './dto/create-condominium.dto';

@ApiTags('condominiums')
@Controller('condominiums')
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Condominium' })
  create(@Body() dto: CreateCondominiumDto) {
    return this.condominiumsService.createCondominium(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all Condominiums' })
  findAll() {
    return this.condominiumsService.findAllCondominiums();
  }
}
