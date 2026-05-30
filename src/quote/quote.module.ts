import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { redisProvider } from '@/redis/redis';

import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';

@Module({
  imports: [HttpModule],
  controllers: [QuoteController],
  providers: [QuoteService, redisProvider],
})
export class QuoteModule {}
