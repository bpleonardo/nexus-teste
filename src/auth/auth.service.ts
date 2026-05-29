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

    const payload = { jti: randomUUID(), sub: user.id, name: user.name };
    const token = await this.jwtService.signAsync(payload, { expiresIn: '5m', notBefore: 0 });

    let refreshToken: string | null = null;
    if (dto.persistent) {
      const refreshInDb = await this.dbService.refreshToken.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          issuedAt: new Date(),
          jti: payload.jti,
        },
      });

      const refreshPayload = { jti: refreshInDb.id, sub: user.id };
      refreshToken = await this.jwtService.signAsync(refreshPayload, {
        expiresIn: '7d',
        notBefore: 0,
      });
    }

    return { token, refreshToken };
  }
}
