import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import type { RedisClientType } from 'redis';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { REDIS_CLIENT } from '@/constants';

@Injectable()
export class QuoteService {
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
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  async getQuote(from: string, to: string, useCache: boolean = true) {
    const fromId = this.FROM_MAP[from.toUpperCase()];
    const toId = this.TO_MAP[to.toUpperCase()];

    if (!fromId || !toId) {
      throw new BadRequestException({ message: 'Invalid currency' });
    }

    const key = `quote:${fromId}:${toId}`;

    if (useCache) {
      const cachedQuote = await this.redisClient.get(key);
      if (cachedQuote) {
        return { price: parseFloat(cachedQuote) };
      }
    }

    const url = `${this.geckoApiUrl}/simple/price?ids=${fromId}&vs_currencies=${toId}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const price = response.data[fromId][toId];

    await this.redisClient.set(key, price.toString(), { EX: 5 * 60 }); // cache for 5 minutes.

    return { price };
  }
}
