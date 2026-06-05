import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';

@Module({
  imports: [HttpModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
