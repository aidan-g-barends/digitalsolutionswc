/** POST /api/admin/logout → clears the session cookie. */
import { clearCookie } from "@/lib/server/auth";

export async function POST() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearCookie() } });
}
