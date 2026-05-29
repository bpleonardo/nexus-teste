import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';
import { type RegisterDTO, registerSchema } from '@/dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() body: RegisterDTO) {
    await this.authService.register(body);
  }
}
