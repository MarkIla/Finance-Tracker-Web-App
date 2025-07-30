// src/summary/summary.controller.spec.ts
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

/* ---------- Mocks ------------------------------------------------------- */

const mockSvc = {
  monthly          : jest.fn(),
  categoryBreakdown: jest.fn(),
  yearToDate       : jest.fn(),
};

/** Guard stub that lets every request through and seeds `req.user` */
class FakeAuthGuard {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    req.user  = { id: 'uid-123' };        // 👈 controller needs this
    return true;
  }
}

/* ---------- Test suite -------------------------------------------------- */

describe('SummaryController (lightweight e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [SummaryController],
      providers  : [
        { provide: SummaryService, useValue: mockSvc },
        /* make the fake guard GLOBAL so every route sees req.user */
        { provide: APP_GUARD,      useClass: FakeAuthGuard },
      ],
    }).compile();

    app = mod.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /summary → 200', () => {
    mockSvc.monthly.mockResolvedValue({});       // body doesn’t matter here
    return request(app.getHttpServer()).get('/summary').expect(200);
  });

  it('GET /summary/categories → 200', () => {
    mockSvc.categoryBreakdown.mockResolvedValue({});
    return request(app.getHttpServer())
      .get('/summary/categories')
      .expect(200);
  });

  it('GET /summary/ytd → 200', () => {
    mockSvc.yearToDate.mockResolvedValue({});
    return request(app.getHttpServer()).get('/summary/ytd').expect(200);
  });
});
