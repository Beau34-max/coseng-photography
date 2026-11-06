// Shared by middleware.js (Edge runtime) and lib/auth.js (Node runtime), so it
// must only use APIs that exist in both. There is deliberately NO fallback value:
// a missing or weak secret makes sign-in fail closed instead of using a known string.
const MIN_LENGTH = 32;

let cached = null;

export function getJwtSecret() {
  if (cached) return cached;
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < MIN_LENGTH) {
    throw new Error(
      `JWT_SECRET is not set or is shorter than ${MIN_LENGTH} characters. ` +
      "Set it to a long random value (for example: openssl rand -base64 48) in .env.local " +
      "and in your hosting provider's environment settings."
    );
  }
  cached = new TextEncoder().encode(raw);
  return cached;
}
