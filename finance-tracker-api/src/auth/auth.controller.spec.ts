import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let app: INestApplication;
  const mockSvc = {
    register: jest.fn().mockResolvedValue({ accessToken: 'jwt' }),
    login: jest.fn().mockResolvedValue({ accessToken: 'jwt' }),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockSvc }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });
  afterAll(() => app.close());

  it('POST /auth/register returns 201 with jwt', () =>
    request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'a@b.com', password: 'pass' })
      .expect(201)
      .expect({ accessToken: 'jwt' }));

  it('POST /auth/login returns 200 with jwt', () =>
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@b.com', password: 'pass' })
      .expect(200)
      .expect({ accessToken: 'jwt' }));
});
