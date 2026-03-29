import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { ROLES_KEY } from './roles.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';
import { UserRole } from '../domain/entities';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Allow routes decorated with @Public() to bypass authentication entirely
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = this.resolveRequest(context);
    const authHeader: string | undefined = request.headers['authorization'];
    const queryToken: string | undefined = request.query?.token
      ? `Bearer ${request.query.token}`
      : undefined;
    const user = await this.authService.validateToken(authHeader || queryToken);
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiredRoles && !requiredRoles.includes(user.role as UserRole)) {
      throw new ForbiddenException('Insufficient role');
    }
    request.user = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
    return true;
  }

  private resolveRequest(context: ExecutionContext) {
    const type = context.getType<string>();
    if (type === 'http') {
      return context.switchToHttp().getRequest();
    }
    if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      return gqlCtx.getContext().req;
    }
    throw new UnauthorizedException('Unsupported context');
  }
}
