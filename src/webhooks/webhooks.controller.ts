import type { Response } from 'express';
import { Body, Controller, HttpCode, HttpStatus, Post, Res, UsePipes } from '@nestjs/common';

import { Public } from '@/utils';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { WebhooksService } from './webhooks.service';
import { type DepositDTO, depositSchema } from './dtos/deposit.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('deposit')
  @Public()
  @UsePipes(new ZodValidationPipe(depositSchema))
  @HttpCode(HttpStatus.NO_CONTENT)
  async deposit(@Body() body: DepositDTO, @Res({ passthrough: true }) res: Response) {
    const { replayed } = await this.webhooksService.deposit(body);
    if (replayed) {
      res.setHeader('Idempotency-Replayed', 'true');
    }
  }
}
