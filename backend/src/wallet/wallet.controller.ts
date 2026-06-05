import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
import type { Request } from 'express';

import { Public } from '@/utils';
import { ParseIntPipe } from '@/pipes/parse-int.pipe';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';
import { AllowedValuesPipe } from '@/pipes/allowed-values.pipe';

import { WalletService } from './wallet.service';
import { type SwapDTO, swapSchema } from './dtos/swap.dto';
import { type WithdrawDTO, withdrawSchema } from './dtos/withdraw.dto';
import { ParseFloatPipe } from '@/pipes/parse-float.pipe';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('quote/:from/:to')
  @Public()
  async getQuote(
    @Param('from') from: string,
    @Param('to') to: string,
    @Query('amount', new ParseFloatPipe()) amount: number,
  ) {
    return { success: true, data: { ...(await this.walletService.getQuote(from, to, amount)) } };
  }

  @Get('balance')
  async getBalance(@Req() req: Request) {
    const user = req['user'];

    return { success: true, data: { ...(await this.walletService.getBalance(user.sub)) } };
  }

  @Get('movements')
  async getMovements(
    @Req() req: Request,
    @Query('cursor') cursor: string,
    @Query('limit', new DefaultValuePipe(10), new ParseIntPipe()) limit: number,
    @Query('sort', new DefaultValuePipe('asc'), new AllowedValuesPipe(['asc', 'desc']))
    sort: 'asc' | 'desc',
  ) {
    const user = req['user'];

    return {
      success: true,
      data: { ...(await this.walletService.getMovements(user.sub, limit, sort, cursor)) },
    };
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ZodValidationPipe(withdrawSchema))
  async withdraw(@Req() req: Request, @Body() body: WithdrawDTO) {
    await this.walletService.withdraw(req['user'].sub, body.currency, body.amount);
  }

  @Post('swap')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(new ZodValidationPipe(swapSchema))
  async swap(@Req() req: Request, @Body() body: SwapDTO) {
    await this.walletService.swap(req['user'].sub, body.fromCurrency, body.toCurrency, body.amount);
  }

  @Get('transactions')
  async getTransactions(
    @Req() req: Request,
    @Query('cursor') cursor: string,
    @Query('limit', new DefaultValuePipe(10), new ParseIntPipe()) limit: number,
    @Query('sort', new DefaultValuePipe('asc'), new AllowedValuesPipe(['asc', 'desc']))
    sort: 'asc' | 'desc',
  ) {
    const user = req['user'];

    return {
      success: true,
      data: { ...(await this.walletService.getTransactions(user.sub, limit, sort, cursor)) },
    };
  }
}
