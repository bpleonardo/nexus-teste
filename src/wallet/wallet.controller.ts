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

import { WalletService } from './wallet.service';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';
import { type WithdrawDTO, withdrawSchema } from './dtos/withdraw.dto';

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

  @Post('withdraw')
  @UsePipes(new ZodValidationPipe(withdrawSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async withdraw(@Req() req: Request, @Body() body: WithdrawDTO) {
    await this.walletService.withdraw(req['user'].sub, body.currency, body.amount);
  }
}
