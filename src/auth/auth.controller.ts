import type { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';

import { Public } from '@/utils';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { AuthService } from './auth.service';
import { type LoginDTO, loginSchema } from './dtos/login.dto';
import { type RegisterDTO, registerSchema } from './dtos/register.dto';

@Controller('auth')
export class AuthController {
  private httpPath: string;

  constructor(
    private authService: AuthService,
    reflector: Reflector,
  ) {
    this.httpPath = reflector.get<string>('path', AuthController) || 'auth';
  }

  @Post('register')
  @Public()
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() body: RegisterDTO) {
    await this.authService.register(body);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Res({ passthrough: true }) res: Response, @Body() body: LoginDTO) {
    const { token, refreshToken } = await this.authService.login(body);

    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        path: `/${this.httpPath}/refresh`,
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return { token };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    const { token, newRefreshToken } = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      path: `/${this.httpPath}/refresh`,
      secure: process.env.NODE_ENV === 'production',
    });

    return { token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Body('allDevices') allDevices: boolean) {
    const accessToken = req['user'];

    await this.authService.logout(accessToken, allDevices);
  }
}
