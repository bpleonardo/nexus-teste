import type { Request } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';

import { Public } from '@/utils';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { WalletService } from './wallet.service';
import { type WithdrawDTO, withdrawSchema } from './dtos/withdraw.dto';
import { type SwapDTO, swapSchema } from './dtos/swap.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('quote/:from/:to')
  @Public()
  getQuote(@Param('from') from: string, @Param('to') to: string, @Query('amount') amount: number) {
    return this.walletService.getQuote(from, to, amount);
  }

  @Get('balance')
  async getBalance(@Req() req: Request) {
    const user = req['user'];

    return { success: true, data: { balance: await this.walletService.getBalance(user.sub) } };
  }

  @Get('movements')
  async getMovements(
    @Req() req: Request,
    @Query('cursor') cursor?: string,
    @Query('limit') limit: number = 10,
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
  ) {
    const user = req['user'];

    return {
      success: true,
      data: { ...(await this.walletService.getMovements(user.sub, limit, sort, cursor)) },
    };
  }

  @Post('withdraw')
  @UsePipes(new ZodValidationPipe(withdrawSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async withdraw(@Req() req: Request, @Body() body: WithdrawDTO) {
    await this.walletService.withdraw(req['user'].sub, body.currency, body.amount);
  }

  @Post('swap')
  @UsePipes(new ZodValidationPipe(swapSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async swap(@Req() req: Request, @Body() body: SwapDTO) {
    await this.walletService.swap(req['user'].sub, body.fromCurrency, body.toCurrency, body.amount);
  }
}
