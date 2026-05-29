import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '@/database/database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({ global: true, secret: '!!!CHANGE THIS VALUE!!!!' }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
