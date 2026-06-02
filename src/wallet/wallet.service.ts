import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import type { RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { DatabaseService } from '@/database/database.service';

import { Errors, REDIS_CLIENT } from '@/constants';
import { CurrencyType, MovementType } from '@prisma/enums';
import type { Transaction } from '@/utils';

@Injectable()
export class WalletService {
  private readonly geckoApiUrl = 'https://api.coingecko.com/api/v3';
  private readonly FROM_MAP = {
    BRL: 'brazilian-real',
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
        transactionId: crypto.randomUUID(),
      },
    });

    await this.redisClient.del(`balance:${userId}`);
  }

  private genCursor(id: string, createdAt: Date) {
    const timestamp = createdAt.getTime();
    return Buffer.from(`${timestamp}:${id}`).toString('base64');
  }

  private getCursorData(cursor: string) {
    const decoded = Buffer.from(cursor, 'base64').toString('ascii');
    const [timestamp, id] = decoded.split(':');
    return { createdAt: new Date(parseInt(timestamp)), id };
  }

  async getMovements(userId: string, limit: number, sort: 'asc' | 'desc', cursor: string | null) {
    const query = {
      where: { accountOwner: userId },
      orderBy: [{ createdAt: sort }, { id: sort }],
      take: limit,
      ...(cursor && { cursor: { ...this.getCursorData(cursor) }, skip: 1 }),
    };

    const movements = await this.dbService.movement.findMany(query);

    const total = movements.length;

    const movementsArray = movements.map((movement) => ({
      id: movement.id,
      type: movement.type,
      currency: movement.currency,
      amount: movement.amount.toNumber(),
      createdAt: movement.createdAt,
      transactionId: movement.transactionId,
    }));

    const nextCursor =
      movements.length === limit
        ? this.genCursor(
            movements[movements.length - 1].id,
            movements[movements.length - 1].createdAt,
          )
        : null;

    // Check if there's a next page by trying to fetch one more record with the next cursor
    const nextExists = nextCursor
      ? await this.dbService.movement.count({
          ...query,
          cursor: { ...this.getCursorData(nextCursor) },
          skip: 1,
          take: 1,
        })
      : 0;

    return { movements: movementsArray, total, nextCursor: nextExists ? nextCursor : null };
  }

  async swap(userId: string, fromCurrency: string, toCurrency: string, amount: number) {
    const quote = await this.getQuote(fromCurrency, toCurrency, amount, false);

    const userBalance = await this.getBalance(userId, false, false);

    if (userBalance.balance[fromCurrency.toUpperCase()] < amount) {
      throw new BadRequestException({
        success: false,
        code: Errors.NO_FUNDS,
        message: 'Insufficient balance',
      });
    }

    await this.dbService.$transaction(async (tx) => {
      const transactionId = crypto.randomUUID();

      await tx.movement.create({
        data: {
          accountOwner: userId,
          currency: fromCurrency.toUpperCase() as keyof typeof CurrencyType,
          type: MovementType.SWAP_OUT,
          amount,
          createdAt: new Date(),
          transactionId,
        },
      });

      await tx.movement.create({
        data: {
          accountOwner: userId,
          currency: toCurrency.toUpperCase() as keyof typeof CurrencyType,
          type: MovementType.SWAP_FEE,
          amount: quote.tax,
          createdAt: new Date(),
          transactionId,
        },
      });

      await tx.movement.create({
        data: {
          accountOwner: userId,
          currency: toCurrency.toUpperCase() as keyof typeof CurrencyType,
          type: MovementType.SWAP_IN,
          amount: quote.amount + quote.tax,
          createdAt: new Date(),
          transactionId,
        },
      });
    });

    await this.redisClient.del(`balance:${userId}`);
  }

  async getTransactions(
    userId: string,
    limit: number,
    sort: 'asc' | 'desc',
    cursor: string | null,
  ) {
    const query = {
      where: { accountOwner: userId },
      orderBy: [{ createdAt: sort }, { transactionId: sort }, { id: sort }],
      take: limit * 3, // We fetch 3 times the limit because some transactions have 3 movements (swap)
      ...(cursor && { cursor: { ...this.getCursorData(cursor) }, skip: 1 }),
    };

    const movements = await this.dbService.movement.findMany(query);

    const grouped = new Map<string, typeof movements>();
    for (const movement of movements) {
      const group = grouped.get(movement.transactionId);
      if (group) {
        group.push(movement);
      } else {
        grouped.set(movement.transactionId, [movement]);
      }
    }

    const transactions: Transaction[] = [];

    for (const [, group] of grouped) {
      if (transactions.length >= limit) break;

      if (group.length === 1) {
        const movement = group[0];
        if (movement.type === MovementType.DEPOSIT || movement.type === MovementType.WITHDRAW) {
          transactions.push({
            type: movement.type,
            originToken: movement.currency,
            destinationToken: null,
            originAmount: movement.amount.toNumber(),
            destinationAmount: null,
            tax: null,
            date: movement.createdAt,
          });
        }
      } else {
        const swapOut = group.find((m) => m.type === MovementType.SWAP_OUT);
        const swapFee = group.find((m) => m.type === MovementType.SWAP_FEE);
        const swapIn = group.find((m) => m.type === MovementType.SWAP_IN);

        if (!swapOut || !swapFee || !swapIn) continue;

        const tax = swapFee.amount.toNumber();
        const grossAmount = swapIn.amount.toNumber();

        transactions.push({
          type: 'SWAP',
          originToken: swapOut.currency,
          destinationToken: swapIn.currency,
          originAmount: swapOut.amount.toNumber(),
          destinationAmount: grossAmount - tax,
          tax,
          date: swapOut.createdAt,
        });
      }
    }

    const transactionIds = [...grouped.keys()];
    const lastTxId = transactions.length === limit ? transactionIds[transactions.length - 1] : null;
    const lastTxMovements = lastTxId ? grouped.get(lastTxId) : null;
    const lastMovement = lastTxMovements ? lastTxMovements[lastTxMovements.length - 1] : null;

    const nextCursor = lastMovement
      ? this.genCursor(lastMovement.id, lastMovement.createdAt)
      : null;

    let nextExists = 0;
    if (nextCursor) {
      nextExists = await this.dbService.movement.count({
        ...query,
        cursor: { ...this.getCursorData(nextCursor) },
        skip: 1,
        take: 1,
      });
    }

    return {
      transactions,
      total: transactions.length,
      nextCursor: nextExists ? nextCursor : null,
    };
  }
}
