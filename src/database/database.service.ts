import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

import { PrismaClient } from '@/prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.get<string>('database.url'),
      password: configService.get<string>('database.password'),
    });
    super({ adapter });
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async cleanupRefreshTokens() {
    const now = new Date();

    await this.refreshToken.deleteMany({
      where: {
        issuedAt: {
          lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Tokens older than 7 days
        },
      },
    });
  }
}
