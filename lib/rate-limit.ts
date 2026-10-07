const attempts = new Map<string, number[]>();

export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function recent(key: string, windowMs: number) {
  const now = Date.now();
  const list = (attempts.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length > 0) attempts.set(key, list);
  else attempts.delete(key);
  return list;
}

export function isRateLimited(key: string, max: number, windowMs: number) {
  return recent(key, windowMs).length >= max;
}

export function recordFailure(key: string, windowMs: number) {
  const list = recent(key, windowMs);
  list.push(Date.now());
  attempts.set(key, list);
}

export function resetAttempts(key: string) {
  attempts.delete(key);
}

export function getClientIp(
  headers: Record<string, string | string[] | undefined> | undefined
) {
  const forwarded = headers?.["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const real = headers?.["x-real-ip"];
  return (
    value?.split(",")[0]?.trim() ||
    (Array.isArray(real) ? real[0] : real) ||
    "unknown"
  );
}
