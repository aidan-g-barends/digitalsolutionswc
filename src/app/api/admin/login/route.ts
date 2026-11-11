/** POST /api/admin/login { password } → sets the session cookie. */
import { adminEnabled, checkPassword, sessionCookie } from "@/lib/server/auth";
import { clientIp, rateLimited } from "@/lib/server/rate";

export async function POST(request: Request) {
  if (!adminEnabled()) return Response.json({ error: "Admin isn't set up. Add ADMIN_PASSWORD on Vercel." }, { status: 503 });
  // Slows down password guessing: 5 tries per 15 minutes per IP.
  if (rateLimited(`login:${clientIp(request)}`, 5, 15 * 60_000)) {
    return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  if (!checkPassword(password)) {
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie() } });
}
