import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Fazer login no sistema' })
  @ApiResponse({
    status: 200,
    description: 'Login feito com sucesso, retorna o token JWT',
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: any, @Body() loginDto: LoginDto) {
    // Graças ao LocalAuthGuard, o req.user já conterá os dados do usuário validados.
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Registrar um novo morador (entra em PENDING)' })
  @ApiResponse({
    status: 201,
    description: 'Usuário cadastrado com sucesso e pendente de aprovação',
  })
  @ApiResponse({
    status: 400,
    description: 'E-mail já em uso ou dados faltantes',
  })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
