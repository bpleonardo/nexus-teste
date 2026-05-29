import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseModule } from '@/database/database.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({ global: true, secret: '!!!CHANGE THIS VALUE!!!!' }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
