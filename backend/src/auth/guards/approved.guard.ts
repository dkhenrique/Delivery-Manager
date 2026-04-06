import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserStatus } from '../../users/entities/user.entity';

import { Request } from 'express';

interface CustomRequest extends Request {
  user?: { status?: UserStatus };
}

/**
 * Guard que verifica se o usuário autenticado está com status APPROVED.
 * Ideal para travar operações ativas (criar pacotes, modificar dados) param usuários PENDING ou REJECTED.
 *
 * NOTA: Deve ser usado APÓS o JwtAuthGuard.
 */
@Injectable()
export class ApprovedStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado no request');
    }

    if (user.status !== UserStatus.APPROVED) {
      throw new ForbiddenException(
        `Acesso negado. Seu cadastro encontra-se com o status: ${user.status}.`,
      );
    }

    return true;
  }
}
