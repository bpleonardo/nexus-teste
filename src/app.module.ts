import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import config from './config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';
import { QuoteModule } from './quote/quote.module';
import { AuthController } from './auth/auth.controller';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [config] }), AuthModule, QuoteModule],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, DatabaseService],
})
export class AppModule {}
