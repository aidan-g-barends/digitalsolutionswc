/**
 * Admin login for /admin. One password (ADMIN_PASSWORD env var), then a signed
 * session cookie that JavaScript can't read (HttpOnly) and other sites can't send
 * (SameSite=Strict). Every admin API route checks it with requireAdmin().
 *
 * Env vars:
 *   ADMIN_PASSWORD        required. Use a long, unique password.
 *   ADMIN_SESSION_SECRET  optional extra secret for signing sessions (any long random string).
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "dswc_admin";
const WEEK = 7 * 24 * 3600;

export const adminEnabled = () => Boolean(process.env.ADMIN_PASSWORD);

function secret() {
  return process.env.ADMIN_SESSION_SECRET || createHash("sha256").update(`dswc:${process.env.ADMIN_PASSWORD}`).digest("hex");
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

/** Constant-time comparison, so an attacker can't guess the password one character at a time. */
function same(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  return Boolean(pw) && same(input, pw!);
}

export function sessionCookie() {
  const exp = Math.floor(Date.now() / 1000) + WEEK;
  const token = `${exp}.${sign(String(exp))}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${WEEK}${secure}`;
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

function readCookie(request: Request) {
  const header = request.headers.get("cookie") ?? "";
  const match = header.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  return match?.slice(COOKIE.length + 1) ?? "";
}

export function isAdmin(request: Request) {
  if (!adminEnabled()) return false;
  const [exp, sig] = readCookie(request).split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  return same(sig, sign(exp));
}

/**
 * Returns a 401/403 Response if the request isn't from a logged-in admin, else null.
 * Changes (POST/PATCH/PUT/DELETE) must also come from this site's own pages.
 */
export function requireAdmin(request: Request): Response | null {
  if (!isAdmin(request)) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return Response.json({ error: "Forbidden." }, { status: 403 });
    }
  }
  return null;
}
