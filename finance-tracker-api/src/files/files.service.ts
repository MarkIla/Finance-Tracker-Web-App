import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { lookup as mimeLookup } from 'mime-types';

@Injectable()
export class FilesService {
  private s3: S3Client;
  private bucket: string;
  private putTTL: number;
  private getTTL: number;

  constructor(private cfg: ConfigService) {
    this.bucket  = this.cfg.get('R2_BUCKET');
    this.putTTL  = +this.cfg.get('R2_PUT_EXPIRY', '600');
    this.getTTL  = +this.cfg.get('R2_GET_EXPIRY', '600');

    this.s3 = new S3Client({
      region: this.cfg.get('R2_REGION', 'auto'),
      endpoint: `https://${this.cfg.get('R2_ACCOUNT')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.cfg.get('R2_ACCESS_KEY'),
        secretAccessKey: this.cfg.get('R2_SECRET_KEY'),
      },
    });
  }

  /** front-end asks: “give me a URL I can PUT my file to” */
  async presignUpload(originalName: string, mime: string) {
    const ext = mimeLookup(mime) ? `.${mimeLookup(mime)!.split('/')[1]}` : '';
    const key = `receipts/${randomUUID()}${ext}`;

    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mime,
    });

    const url = await getSignedUrl(this.s3, cmd, { expiresIn: this.putTTL });

    return { key, url, expiresIn: this.putTTL };
  }

  /** signed GET URL for <img src=""> */
  async presignDownload(key: string) {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const url = await getSignedUrl(this.s3, cmd, { expiresIn: this.getTTL });
    return { url, expiresIn: this.getTTL };
  }
}
