import type { RedisClientType } from 'redis';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CurrencyType, MovementType } from '@/prisma/enums';

import { Errors, REDIS_CLIENT } from '@/constants';
import { DatabaseService } from '@/database/database.service';

import type { DepositDTO } from './dtos/deposit.dto';

@Injectable()
export class WebhooksService {
  private readonly SUPPORTED_TOKENS = ['BRL', 'BTC', 'ETH'];

  constructor(
    private readonly dbService: DatabaseService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  async deposit(body: DepositDTO): Promise<{ replayed: boolean }> {
    const { userId, token, amount, idempotencyKey } = body;

    const alreadyProcessed = await this.redisClient.get(`deposit:${idempotencyKey}`);

    if (alreadyProcessed) {
      return { replayed: true };
    }

    if (!this.SUPPORTED_TOKENS.includes(token)) {
      throw new BadRequestException({
        success: false,
        code: Errors.INVALID_CURRENCY,
        message: 'Unsupported token',
      });
    }

    const user = await this.dbService.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        success: false,
        code: Errors.NOT_FOUND,
        message: 'User not found',
      });
    }

    await this.dbService.movement.create({
      data: {
        accountOwner: user.id,
        currency: CurrencyType[token],
        type: MovementType.DEPOSIT,
        amount,
        createdAt: new Date(),
        transactionId: crypto.randomUUID(),
      },
    });

    await this.redisClient.set(`deposit:${idempotencyKey}`, 'true', {
      expiration: { type: 'EX', value: 60 * 60 * 24 },
    }); // Cache for 24 hours

    // Invalidate the user's balance cache
    await this.redisClient.del(`balance:${userId}`);

    return { replayed: false };
  }
}
