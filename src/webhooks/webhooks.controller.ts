import { Body, Controller, Post, UsePipes } from '@nestjs/common';

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
  async deposit(@Body() body: DepositDTO) {
    await this.webhooksService.deposit(body);
  }
}
