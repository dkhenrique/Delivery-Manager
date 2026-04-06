import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { ConfirmPickupDto } from './dto/confirm-pickup.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApprovedStatusGuard } from '../auth/guards/approved-status.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Throttle } from '@nestjs/throttler';

interface AuthenticatedUser {
  id: string;
  apartment_id: string | null;
  role: UserRole;
  status: string;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// RN-15: Configuração do multer para upload local
const photoStorage = diskStorage({
  destination: './uploads/packages',
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${uniqueName}${ext}`);
  },
});

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@ApiTags('packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @UseGuards(ApprovedStatusGuard)
  @ApiOperation({
    summary: 'Registrar uma encomenda recebida (moradores aprovados)',
  })
  @ApiResponse({
    status: 201,
    description: 'Encomenda registrada com código de retirada',
  })
  create(@Body() dto: CreatePackageDto, @Req() req: AuthenticatedRequest) {
    return this.packagesService.create(dto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas as encomendas (Admin only)' })
  findAll() {
    return this.packagesService.findAll();
  }

  @Get('my')
  @ApiOperation({
    summary: 'Listar encomendas destinadas ao meu apartamento',
  })
  findMyPackages(@Req() req: AuthenticatedRequest) {
    return this.packagesService.findMyPackages(req.user.apartment_id || null);
  }

  @Get('guarded')
  @ApiOperation({
    summary: 'Listar encomendas que estou guardando',
  })
  findGuardedByMe(@Req() req: AuthenticatedRequest) {
    return this.packagesService.findGuardedByMe(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de uma encomenda' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.findOne(id);
  }

  @Patch(':id/confirm')
  @UseGuards(ApprovedStatusGuard)
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // RN-19: 5 tentativas por 15 min
  @ApiOperation({
    summary: 'Confirmar retirada via código de 6 dígitos',
  })
  @ApiResponse({ status: 200, description: 'Retirada confirmada com sucesso' })
  @ApiResponse({ status: 400, description: 'Código de retirada inválido' })
  confirmPickup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmPickupDto,
  ) {
    return this.packagesService.confirmPickup(id, dto.code);
  }

  @Post(':id/resend-code')
  @UseGuards(ApprovedStatusGuard)
  @ApiOperation({
    summary: 'Reenviar ou regenerar código de retirada',
  })
  @ApiResponse({ status: 200, description: 'Código reenviado/regenerado' })
  resendCode(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.resendCode(id);
  }

  @Post(':id/photo')
  @UseGuards(ApprovedStatusGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: photoStorage,
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Formato de arquivo não aceito. Use JPG, PNG ou WEBP.',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({
    summary: 'Enviar foto da encomenda (máx 5MB, JPG/PNG/WEBP)',
  })
  uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhuma foto enviada');
    }

    const photoUrl = `/uploads/packages/${file.filename}`;
    return this.packagesService.uploadPhoto(id, photoUrl);
  }
}
