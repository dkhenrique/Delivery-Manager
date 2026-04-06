import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserStatus } from '../../users/entities/user.entity';

interface AuthenticatedUser {
  id: string;
  status: UserStatus;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * Guard que verifica se o usuário autenticado tem status APPROVED.
 * Moradores com status PENDING não podem registrar encomendas (RN-05/RN-11).
 *
 * Uso: @UseGuards(JwtAuthGuard, ApprovedStatusGuard)
 */
@Injectable()
export class ApprovedStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return false;
    }

    if (user.status !== UserStatus.APPROVED) {
      throw new ForbiddenException(
        'Seu cadastro precisa estar aprovado para realizar esta ação',
      );
    }

    return true;
  }
}
