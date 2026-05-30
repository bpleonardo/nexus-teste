import type { RedisClientType } from 'redis';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CurrencyType, MovementType } from '@/prisma/enums';

import { REDIS_CLIENT } from '@/constants';
import { DatabaseService } from '@/database/database.service';

import type { DepositDTO } from './dtos/deposit.dto';

@Injectable()
export class WebhooksService {
  private readonly SUPPORTED_TOKENS = ['BRL', 'BTC', 'ETH'];

  constructor(
    private readonly dbService: DatabaseService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  async deposit(body: DepositDTO) {
    // TODO: Validate idempotencyKey to prevent duplicate processing of the same deposit.
    const { userId, token, amount, idempotencyKey } = body;

    if (!this.SUPPORTED_TOKENS.includes(token)) {
      throw new NotFoundException({ message: 'Unsupported token' });
    }

    const user = await this.dbService.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    await this.dbService.movement.create({
      data: {
        accountOwner: user.id,
        currency: CurrencyType[token],
        type: MovementType.DEPOSIT,
        amount,
      },
    });

    // Invalidate the user's balance cache
    await this.redisClient.del(`balance:${userId}`);
  }
}
