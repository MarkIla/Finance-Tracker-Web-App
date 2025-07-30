import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('FilesController (lightweight-e2e)', () => {
  let app: INestApplication;

  const mockSvc = {
    presignUpload  : jest.fn(),
    presignDownload: jest.fn(),
  };

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: FilesService, useValue: mockSvc },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    app = mod.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /files/presign-upload → 201', async () => {
    mockSvc.presignUpload.mockResolvedValue({ key: 'k', url: 'u' });

    await request(app.getHttpServer())
      .post('/files/presign-upload')
      .send({ filename: 'x.jpg', mime: 'image/jpeg' })
      .expect(201)
      .expect({ key: 'k', url: 'u' });
  });

  it('GET /files/presign-download/:key → 200', async () => {
    mockSvc.presignDownload.mockResolvedValue({ url: 'u' });

    await request(app.getHttpServer())
      .get('/files/presign-download/k')
      .expect(200)
      .expect({ url: 'u' });
  });
});
