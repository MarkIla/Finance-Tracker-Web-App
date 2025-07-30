import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import bcrypt from 'bcrypt';

/* fully mock bcrypt once */
jest.mock('bcrypt', () => ({
  hash   : jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  const jwt = { sign: jest.fn().mockReturnValue('jwt') };

  const repoFactory = () =>
    ({
      create   : jest.fn(),
      save     : jest.fn(),
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>);

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService,      useValue: jwt },
        { provide: ConfigService,   useValue: { get: jest.fn() } },
        { provide: getRepositoryToken(User), useFactory: repoFactory },
      ],
    }).compile();

    service  = mod.get(AuthService);
    userRepo = mod.get(getRepositoryToken(User));
  });

   it('registers user & returns jwt', async () => {
    /* ensure create() already contains id + email */
    userRepo.create.mockReturnValue({ id: 'u', email: 'a@b.com' } as any);
    userRepo.save.mockResolvedValue({ id: 'u', email: 'a@b.com' } as any);

    const res = await service.register({ email: 'a@b.com', password: 'p' });
    expect(res.accessToken).toBe('jwt');
  });
});
