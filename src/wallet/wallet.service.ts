import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import type { RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { DatabaseService } from '@/database/database.service';

import { Errors, REDIS_CLIENT } from '@/constants';
import { CurrencyType, MovementType } from '@prisma/enums';

@Injectable()
export class WalletService {
  private readonly geckoApiUrl = 'https://api.coingecko.com/api/v3';
  private readonly FROM_MAP = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
  };
  private readonly TO_MAP = {
    BRL: 'brl',
    ETH: 'eth',
    BTC: 'btc',
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly dbService: DatabaseService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  async getQuote(from: string, to: string, amount: number, useCache: boolean = true) {
    const fromId = this.FROM_MAP[from.toUpperCase()];
    const toId = this.TO_MAP[to.toUpperCase()];

    if (!fromId || !toId) {
      throw new BadRequestException({
        success: false,
        code: Errors.INVALID_CURRENCY,
        message: 'Invalid currency',
      });
    }

    const key = `quote:${fromId}:${toId}`;

    if (useCache) {
      const cachedQuote = await this.redisClient.get(key);
      if (cachedQuote) {
        const calculated = parseFloat(cachedQuote) * amount;
        const tax = calculated * this.configService.get('app.transactionTax');
        const finalAmount = calculated - tax;

        return { amount: finalAmount, tax, quote: parseFloat(cachedQuote) };
      }
    }

    const url = `${this.geckoApiUrl}/simple/price?ids=${fromId}&vs_currencies=${toId}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const quote = response.data[fromId][toId];

    await this.redisClient.set(key, quote.toString(), {
      expiration: { type: 'EX', value: 5 * 60 },
    }); // cache for 5 minutes.

    const calculated = quote * amount;
    const tax = calculated * this.configService.get('app.transactionTax');
    const finalAmount = calculated - tax;

    return { amount: finalAmount, tax, quote };
  }

  async getBalance(userId: string, useCache: boolean = true, calcTotal: boolean = true) {
    if (useCache) {
      const cachedBalance = await this.redisClient.get(`balance:${userId}`);
      if (cachedBalance) {
        return { balance: JSON.parse(cachedBalance) };
      }
    }

    const userMovements = await this.dbService.movement.findMany({
      where: { accountOwner: userId },
    });

    let balances = {
      BRL: 0.0,
      BTC: 0.0,
      ETH: 0.0,
      totalInBRL: 0.0,
    };

    for (const movement of userMovements) {
      const currency = movement.currency;
      const amount = movement.amount;

      if (!balances[currency]) {
        balances[currency] = 0.0;
      }

      if (movement.type === MovementType.DEPOSIT || movement.type === MovementType.SWAP_IN) {
        balances[currency] += amount.toNumber();
      } else if (
        movement.type === MovementType.WITHDRAW ||
        movement.type === MovementType.SWAP_OUT ||
        movement.type === MovementType.SWAP_FEE
      ) {
        balances[currency] -= amount.toNumber();
      }
    }

    // Calculate the total balance in BRL
    if (calcTotal) {
      for (const [currency, amount] of Object.entries(balances)) {
        if (!amount) continue;
        if (currency === 'BRL') {
          balances.totalInBRL += amount;
        }
        if (currency === 'BTC' || currency === 'ETH') {
          const quote = await this.getQuote(currency, 'BRL', 1, false);
          balances.totalInBRL += amount * quote.quote;
        }
      }

      // Cache for 1 hour.
      // We invalidate this cache on every movement, so it should be fine.
      // Although, totalInBRL might get a bit stale if the user doesn't make movements for a while,
      // but we can live with that for now.
      await this.redisClient.set(`balance:${userId}`, JSON.stringify(balances), {
        expiration: { type: 'EX', value: 1 * 60 * 60 },
      });
    }

    return { balance: balances };
  }

  async withdraw(userId: string, currency: string, amount: number) {
    currency = currency.toUpperCase();

    if (CurrencyType[currency] === undefined) {
      throw new BadRequestException({
        success: false,
        code: Errors.INVALID_CURRENCY,
        message: 'Invalid currency',
      });
    }

    const balanceData = await this.getBalance(userId, false, false);

    const userBalance = balanceData.balance[currency.toUpperCase()];

    if (userBalance < amount) {
      throw new BadRequestException({
        success: false,
        code: Errors.NO_FUNDS,
        message: 'Insufficient balance',
      });
    }

    await this.dbService.movement.create({
      data: {
        accountOwner: userId,
        currency: currency.toUpperCase() as keyof typeof CurrencyType,
        type: MovementType.WITHDRAW,
        amount,
        createdAt: new Date(),
      },
    });

    await this.redisClient.del(`balance:${userId}`);
  }
}
