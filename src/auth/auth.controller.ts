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
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken } = await this.auth.register(dto);
    res.cookie('auth', accessToken, { httpOnly: true, sameSite: 'lax', path: '/' });
    return { ok: true };
  }

  /* POST /auth/login */
  @Post('login')
  async login(
  @Body() dto: LoginDto,
  @Res({ passthrough: true }) res: Response,
) {
  const { accessToken } = await this.auth.login(dto);

  res.cookie('auth', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24,
  });

  // 👇 send token back so front-end can decode
  return { accessToken };
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;                 // { sub, email }
  }
}
