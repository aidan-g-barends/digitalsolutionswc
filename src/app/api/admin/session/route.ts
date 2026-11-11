/** GET /api/admin/session: is the visitor signed in, and is the admin set up at all? */
import { adminEnabled, isAdmin } from "@/lib/server/auth";

export async function GET(request: Request) {
  return Response.json({ configured: adminEnabled(), signedIn: isAdmin(request) });
}
