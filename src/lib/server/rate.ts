/**
 * Simple in-memory rate limiter (per server instance). Protects the free AI quota
 * and the forms from spam. It resets when Vercel starts a fresh instance, which is
 * fine for this purpose: it stops bursts, not determined attackers.
 */
const buckets = new Map<string, number[]>();

export function rateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  // Keep memory bounded.
  if (buckets.size > 5000) buckets.clear();
  return recent.length > limit;
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
