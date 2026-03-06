export function isBlobConfigured(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return !!token && token.length > 20 && !token.includes("...");
}
