
/** Extract the checksum headers the presigner put in the query-string */
export function checksumHeaders(url: string) {
  const u = new URL(url);
  const algo = u.searchParams.get('X-Amz-Sdk-Checksum-Algorithm');
  const crc  = u.searchParams.get('X-Amz-Checksum-Crc32');
  const h: Record<string, string> = {};
  if (algo) h['x-amz-sdk-checksum-algorithm'] = algo;
  if (crc)  h['x-amz-checksum-crc32']         = crc;
  return h;
}
