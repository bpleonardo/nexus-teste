import type { Request } from 'express';
import { Controller, Get, Param, Query, Req } from '@nestjs/common';

import { Public } from '@/utils';

import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('quote/:from/:to')
  @Public()
  getQuote(@Param('from') from: string, @Param('to') to: string, @Query('amount') amount: number) {
    return this.walletService.getQuote(from, to, amount);
  }

  @Get('balance')
  getBalance(@Req() req: Request) {
    const user = req['user'];

    return this.walletService.getBalance(user.sub);
  }
}
