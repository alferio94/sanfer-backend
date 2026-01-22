import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard combinado que acepta autenticación de admin (jwt) O event-user (event-user-jwt).
 * Útil para endpoints que necesitan ser accedidos tanto desde el dashboard como desde la app móvil.
 *
 * Flujo:
 * 1. Intenta autenticar con estrategia 'jwt' (admin)
 * 2. Si falla, intenta con estrategia 'event-user-jwt' (mobile)
 * 3. Si ambos fallan, retorna 401 Unauthorized
 */
@Injectable()
export class CombinedAuthGuard extends AuthGuard(['jwt', 'event-user-jwt']) {
  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !user) {
      throw new UnauthorizedException(
        'Se requiere autenticación de admin o usuario de evento',
      );
    }
    return user;
  }
}
