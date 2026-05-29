import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

import { PrismaClient } from '@/prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.get<string>('database.url'),
      password: configService.get<string>('database.password'),
    });
    super({ adapter });
  }
}
