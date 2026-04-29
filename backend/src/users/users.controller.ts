import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateMyProfileDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, UserStatus } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar um novo usuário (Admin only)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os moradores (Admin only)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('pending')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar cadastros pendentes (Admin only)' })
  findPending() {
    return this.usersService.findAllPending();
  }

  @Get('me')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso' })
  getMyProfile(@Request() req: { user: { id: string } }) {
    return this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar apartamento do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  updateMyProfile(
    @Request() req: { user: { id: string } },
    @Body() updateMyProfileDto: UpdateMyProfileDto,
  ) {
    return this.usersService.update(req.user.id, updateMyProfileDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Buscar morador por ID (Admin only)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar dados de um morador (Admin only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Aprovar um morador (Admin only)' })
  @ApiResponse({ status: 200, description: 'Morador aprovado com sucesso' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.updateStatus(id, {
      status: UserStatus.APPROVED,
    });
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Rejeitar um morador (Admin only)' })
  @ApiResponse({ status: 200, description: 'Morador rejeitado com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Justificativa de rejeição obrigatória',
  })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('rejection_reason') rejectionReason: string,
  ) {
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw new BadRequestException(
        'Justificativa de rejeição é obrigatória (RN-07)',
      );
    }

    return this.usersService.updateStatus(id, {
      status: UserStatus.REJECTED,
      rejection_reason: rejectionReason.trim(),
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover um morador (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
