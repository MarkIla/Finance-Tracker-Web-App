import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenResponse } from './types/token-response.type';

@Injectable()
export class AuthService {
 constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

   /* ------------ Registration ------------ */
  async register(dto: RegisterDto): Promise<TokenResponse> {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already in use');

    const rounds = parseInt(this.config.get('BCRYPT_ROUNDS', '12'), 10);
    const hash = await bcrypt.hash(dto.password, rounds);
    const user = this.usersRepo.create({ 
      email: dto.email, 
      passwordHash: hash });
    await this.usersRepo.save(user);

    return this.issueAccessToken(user);
  }

  /* --------------- Login --------------- */
  async login(dto: LoginDto): Promise<TokenResponse> {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueAccessToken(user);
  }

  /* --------------- Refresh ------------- */
  async refresh(userId: string): Promise<TokenResponse> {
    const user = await this.usersRepo.findOneByOrFail({ id: userId });
    return this.issueAccessToken(user);
  }

  /* --------------- Helpers ------------- */
  private async issueAccessToken(user: User): Promise<TokenResponse> {
    const expiresIn = this.ttlSeconds();
    const accessToken = await this.jwt.signAsync({ sub: user.id } /* payload */);
    return { accessToken, expiresIn };
  }

  private ttlSeconds(): number {
    const ttl = this.config.get<string>('ACCESS_TOKEN_TTL')!;     // e.g. "900s"
    return parseInt(ttl, 10);
  }
}
