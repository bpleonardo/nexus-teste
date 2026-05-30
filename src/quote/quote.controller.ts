import { Controller, Get, Param, Query } from '@nestjs/common';

import { Public } from '@/utils';

import { QuoteService } from './quote.service';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get(':from/:to')
  @Public()
  getQuote(@Param('from') from: string, @Param('to') to: string, @Query('amount') amount: number) {
    return this.quoteService.getQuote(from, to, amount);
  }
}
