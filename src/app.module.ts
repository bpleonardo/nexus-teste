import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import config from './config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { QuoteModule } from './quote/quote.module';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [config] }), AuthModule, QuoteModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
