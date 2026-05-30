import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

import { DatabaseService } from '@/database/database.service';

import type { LoginDTO } from './dtos/login.dto';
import type { RegisterDTO } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private dbService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async register(dto: RegisterDTO) {
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
            password: await this.hashPassword(dto.password),
          },
        });

        return true;
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.table(error.meta.target);
        throw new ConflictException({
          status: 409,
          message: 'User with this email, cpf, or phone already exists.',
        });
      }
      throw error;
    }
  }

  private async genAccessToken(userId: string, name: string) {
    const payload = { jti: randomUUID(), sub: userId, name };
    return {
      token: await this.jwtService.signAsync(payload, { expiresIn: '5m', notBefore: 0 }),
      jti: payload.jti,
    };
  }

  async login(dto: LoginDTO) {
    const credentials = await this.dbService.userCredentials.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!credentials) {
      throw new UnauthorizedException({
        status: 401,
        message: 'Invalid email or password.',
      });
    }

    const passwordMatches = await argon2.verify(credentials.password, dto.password);

    if (!passwordMatches) {
      throw new UnauthorizedException({
        status: 401,
        message: 'Invalid email or password.',
      });
    }

    const user = await this.dbService.user.findUnique({ where: { email: credentials.email } });

    if (!user) {
      // User was probably deleted after we validated the credentials, but before we fetched the user data.
      throw new UnauthorizedException({
        status: 401,
        message: 'Invalid email or password.',
      });
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
        expiresIn: '7d',
        notBefore: 0,
      });
    }

    return { token, refreshToken };
  }

  async refresh(refreshToken: string) {
    let decoded: any;

    try {
      decoded = await this.jwtService.verifyAsync(refreshToken);
    } catch (error) {
      throw new UnauthorizedException({
        status: 401,
        message: 'Invalid refresh token.',
      });
    }

    const storedToken = await this.dbService.refreshToken.findUnique({
      where: { id: decoded.jti },
    });

    if (!storedToken) {
      throw new UnauthorizedException({
        status: 401,
        message: 'Invalid refresh token.',
      });
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException({
        status: 401,
        message: 'Invalid refresh token.',
      });
    }

    const user = await this.dbService.user.findUnique({ where: { id: storedToken.userId } });

    if (!user) {
      throw new UnauthorizedException({
        status: 401,
        message: 'Invalid refresh token.',
      });
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
      expiresIn: '7d',
      notBefore: 0,
    });

    await this.dbService.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // TODO: Blacklist old access token until it expires, to prevent reuse.

    return { token, newRefreshToken };
  }
  catch() {
    throw new UnauthorizedException({
      status: 401,
      message: 'Invalid refresh token.',
    });
  }
}
