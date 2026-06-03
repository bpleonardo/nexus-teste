import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import type { RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { Errors, REDIS_CLIENT } from '@/constants';
import { DatabaseService } from '@/database/database.service';

import type { LoginDTO } from './dtos/login.dto';
import type { RegisterDTO } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dbService: DatabaseService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async register(dto: RegisterDTO) {
    // We hash the password as early as possible to avoid leaking.
    const hashedPassword = await this.hashPassword(dto.password);
    dto.password = '';

    try {
      await this.dbService.$transaction(async (tx) => {
        let user = await tx.user.create({
          data: { name: dto.name, email: dto.email, cpf: dto.cpf, phone: dto.phone },
        });

        await tx.userAddress.create({
          data: {
            userId: user.id,
            ...dto.address,
          },
        });

        await tx.userCredentials.create({
          data: {
            email: user.email,
            password: hashedPassword,
          },
        });

        return true;
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException({
          success: false,
          code: Errors.ALREADY_EXISTS,
          message: 'User with this email, cpf, or phone already exists.',
        });
      }
      throw error;
    }
  }

  private async genAccessToken(userId: string, name: string) {
    const payload = { jti: randomUUID(), sub: userId, name };
    return {
      token: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('jwt.accessTokenExpiration'),
        notBefore: 0,
      }),
      jti: payload.jti,
    };
  }

  async login(dto: LoginDTO) {
    // We use the same error message for all cases to avoid leaking information about
    // exisiting users.
    const exception = new UnauthorizedException({
      status: 401,
      message: 'Invalid email or password.',
    });

    const credentials = await this.dbService.userCredentials.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!credentials) {
      throw exception;
    }

    const passwordMatches = await argon2.verify(credentials.password, dto.password);

    if (!passwordMatches) {
      throw exception;
    }

    const user = await this.dbService.user.findUnique({ where: { email: credentials.email } });

    if (!user) {
      // User was probably deleted after we validated the credentials, but before we fetched the user data.
      throw exception;
    }

    const { token, jti } = await this.genAccessToken(user.id, user.name);

    let refreshToken: string | null = null;
    if (dto.persistent) {
      const refreshInDb = await this.dbService.refreshToken.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          issuedAt: new Date(),
          jti: jti,
        },
      });

      const refreshPayload = { jti: refreshInDb.id };
      refreshToken = await this.jwtService.signAsync(refreshPayload, {
        expiresIn: this.configService.get('jwt.refreshTokenExpiration'),
        notBefore: 0,
      });
    }

    return { token, refreshToken };
  }

  private blacklistToken(jti: string) {
    return this.redisClient.set(`blacklist:${jti}`, 'r', {
      expiration: { type: 'PX', value: this.configService.get('jwt.accessTokenExpiration')! },
    });
  }

  async refresh(refreshToken: string) {
    let decoded: any;
    const exception = new UnauthorizedException({
      status: 401,
      message: 'Invalid refresh token.',
    });

    try {
      decoded = await this.jwtService.verifyAsync(refreshToken);
    } catch (error) {
      throw exception;
    }

    const storedToken = await this.dbService.refreshToken.findUnique({
      where: { id: decoded.jti },
    });

    if (!storedToken) {
      throw exception;
    }

    if (storedToken.revokedAt) {
      throw exception;
    }

    const user = await this.dbService.user.findUnique({ where: { id: storedToken.userId } });

    if (!user) {
      throw exception;
    }

    const { token, jti } = await this.genAccessToken(user.id, user.name);

    const newRefreshDb = await this.dbService.refreshToken.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        issuedAt: new Date(),
        jti: jti,
      },
    });

    const refreshPayload = { jti: newRefreshDb.id };

    const newRefreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: this.configService.get('jwt.refreshTokenExpiration'),
      notBefore: 0,
    });

    await this.dbService.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Blacklist the old access token until it expires, to prevent reuse.
    await this.blacklistToken(storedToken.jti);

    return { token, newRefreshToken };
  }

  async logout(accessToken: Record<string, string>, allDevices: boolean) {
    if (allDevices) {
      const allRefreshTokens = await this.dbService.refreshToken.findMany({
        where: { userId: accessToken.sub, revokedAt: null },
      });

      await this.dbService.refreshToken.updateMany({
        where: { userId: accessToken.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      for (const storedToken of allRefreshTokens) {
        await this.blacklistToken(storedToken.jti);
      }
    } else {
      const jti = accessToken.jti;

      await this.dbService.refreshToken.updateMany({
        where: { jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await this.blacklistToken(jti);
    }
  }
}
