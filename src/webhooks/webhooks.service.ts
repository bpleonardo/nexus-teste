import { Injectable, NotFoundException } from '@nestjs/common';

import { CurrencyType, MovementType } from '@/prisma/enums';

import { DatabaseService } from '@/database/database.service';

import type { DepositDTO } from './dtos/deposit.dto';

@Injectable()
export class WebhooksService {
  private readonly SUPPORTED_TOKENS = ['BRL', 'BTC', 'ETH'];

  constructor(private readonly dbService: DatabaseService) {}

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
  }
}
