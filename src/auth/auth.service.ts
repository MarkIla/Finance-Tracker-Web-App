import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
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
  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOneBy({ email: dto.email });
    if (exists) {
      throw new ConflictException('email_exists');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, passwordHash: hash });
    await this.usersRepo.save(user);

    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return { accessToken };
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
