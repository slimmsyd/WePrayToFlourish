// Admin auth primitives — single-password login with a signed session cookie.
//
// IMPORTANT: no `import "server-only"` here. This module is imported by
// proxy.ts (which runs before rendering) AND by Server Actions / route
// handlers. It uses Web Crypto (crypto.subtle), which is available in every
// runtime, so the same code is safe everywhere.
//
// Reproducible as a template: all credentials live in env vars, never in code.
//   SESSION_SECRET        — HMAC key for the session cookie (required)
//   ADMIN_PASSWORD_HASH   — sha256 hex of the admin password (preferred)
//   ADMIN_PASSWORD        — plaintext fallback if no hash is set
//
// Cookie-reading helpers (getSession/requireAdmin) live in lib/auth-server.ts
// so this file stays free of next/headers and is safe to import from proxy.ts.

export const SESSION_COOKIE = "wptf_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Read lazily (not at import) so `next build` works before SESSION_SECRET is
// set. verifySession() treats a missing secret as "no valid session".

const enc = new TextEncoder();

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set.");
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Constant-time byte comparison. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Create a signed session token: base64url(payload).base64url(hmac). */
export async function signSession(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ iat: now, exp: now + SESSION_TTL_SECONDS });
  const payloadB64 = bytesToB64url(enc.encode(payload));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payloadB64));
  return `${payloadB64}.${bytesToB64url(new Uint8Array(sig))}`;
}

/** Verify a session token's signature and expiry. */
export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return false;

  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payloadB64)),
  );
  let provided: Uint8Array;
  try {
    provided = b64urlToBytes(sigB64);
  } catch {
    return false;
  }
  if (!timingSafeEqual(expected, provided)) return false;

  try {
    const { exp } = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)));
    return typeof exp === "number" && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Check a submitted password against ADMIN_PASSWORD_HASH (preferred) or ADMIN_PASSWORD. */
export async function verifyPassword(input: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    const got = await sha256Hex(input);
    return timingSafeEqual(enc.encode(got), enc.encode(hash));
  }
  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) {
    throw new Error("Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is set.");
  }
  // Compare hashed forms so the comparison is constant-cost regardless of length.
  return timingSafeEqual(enc.encode(await sha256Hex(input)), enc.encode(await sha256Hex(plain)));
}
