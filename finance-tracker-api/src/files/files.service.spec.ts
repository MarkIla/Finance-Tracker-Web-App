import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FilesService } from './files.service';

/* ─── mock @aws-sdk/client-s3 + presigner ────────────────────────── */
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
}));
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://signed.example.com'),
}));

describe('FilesService', () => {
  let svc: FilesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: ConfigService,
          useValue: {
            get: (k: string) =>
              ({
                R2_BUCKET: 'bucket',
                R2_ACCOUNT: 'acct',
                R2_REGION: 'auto',
                R2_ACCESS_KEY: 'AK',
                R2_SECRET_KEY: 'SK',
                R2_PUT_EXPIRY: '600',
                R2_GET_EXPIRY: '600',
              } as Record<string, string>)[k],
          },
        },
      ],
    }).compile();

    svc = module.get(FilesService);
  });

  it('presigns upload and returns key + url', async () => {
    const res = await svc.presignUpload('invoice.png', 'image/png');

    expect(res).toHaveProperty('key');
    expect(res).toEqual(
      expect.objectContaining({ url: 'https://signed.example.com', expiresIn: 600 }),
    );
  });

  it('presigns download', async () => {
    const res = await svc.presignDownload('receipts/abc.png');
    expect(res).toEqual({ url: 'https://signed.example.com', expiresIn: 600 });
  });
});
