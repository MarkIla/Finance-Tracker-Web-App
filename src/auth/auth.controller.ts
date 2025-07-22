import { Controller, Post, Body, UseGuards, Req, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /* POST /auth/register */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  /* POST /auth/login */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /* GET /auth/refresh
     Front-end calls this when access-token expired.
     Requires a *valid* access token (or exchange flow using refresh cookies—see note below). */
  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  refresh(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.auth.refresh(user.id);
  }
}
