import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { RedisClientType } from 'redis';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Errors, IS_PUBLIC_KEY, REDIS_CLIENT } from '@/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // https://docs.nestjs.com/security/authentication#implementing-the-authentication-guard
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        success: false,
        code: Errors.MISSING_TOKEN,
        message: 'No token provided',
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      const isBlacklisted = await this.redisClient.get(`blacklist:${payload.jti}`);
      if (isBlacklisted) {
        throw new UnauthorizedException({
          success: false,
          code: Errors.INVALID_TOKEN,
          message: 'Invalid token',
        });
      }

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException({
        success: false,
        code: Errors.INVALID_TOKEN,
        message: 'Invalid token',
      });
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
