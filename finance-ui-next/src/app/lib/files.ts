import { api } from './api';

/** Get a one-time PUT url for Cloudflare upload */
export async function presignUpload(file: File) {
  const { data } = await api.post('/files/presign-upload', {
    filename: file.name,
    mime: file.type,
  });
  return data as { key: string; url: string };
}

/** Get a temporary GET url for viewing */
export async function presignDownload(key: string) {
  const { data } = await api.get(`/files/presign-download/${encodeURIComponent(key)}`);
  return data as { url: string };
}

/** Extract the checksum headers the presigner put in the query-string */
export function checksumHeaders(rawUrl: string) {
  const u = new URL(rawUrl);
  const algo = u.searchParams.get('X-Amz-Sdk-Checksum-Algorithm');
  const crc  = u.searchParams.get('X-Amz-Checksum-Crc32');
  const h: Record<string, string> = {};
  if (algo) h['x-amz-sdk-checksum-algorithm'] = algo;
  if (crc)  h['x-amz-checksum-crc32']         = crc;
  return h;
}

const previewCache = new Map<string, string>(); // key ➜ url

export async function getPreviewUrl(key: string) {
  if (previewCache.has(key)) return previewCache.get(key)!;
  const { url } = await presignDownload(key);
  previewCache.set(key, url);
  return url;
}