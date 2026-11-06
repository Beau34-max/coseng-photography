// Small in-memory limiter. It protects a single server process and resets when the
// process restarts, so on serverless hosting treat it as a speed bump, not a guarantee.
// Move to a shared store (for example Redis) before relying on it for high-value limits.
const buckets = new Map();

export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
  }
  let bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    bucket = { count: 0, reset: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  return {
    ok: bucket.count <= limit,
    retryAfter: Math.max(1, Math.ceil((bucket.reset - now) / 1000)),
  };
}

// `headers` is a standard Headers object (req.headers or next/headers headers()).
export function clientIp(headers) {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : headers.get("x-real-ip");
  return ip || "unknown";
}
