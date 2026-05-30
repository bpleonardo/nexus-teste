import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';

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

  constructor(private readonly httpService: HttpService) {}

  async getQuote(from: string, to: string) {
    const fromId = this.FROM_MAP[from.toUpperCase()];
    const toId = this.TO_MAP[to.toUpperCase()];

    if (!fromId || !toId) {
      throw new BadRequestException({ message: 'Invalid currency' });
    }

    const url = `${this.geckoApiUrl}/simple/price?ids=${fromId}&vs_currencies=${toId}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const price = response.data[fromId][toId];
      return { price };
    } catch (error) {
      throw new BadRequestException({ message: 'Error fetching quote' });
    }
  }
}
