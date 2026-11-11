/**
 * Admin leads API.
 *   GET    /api/admin/leads            → newest 300 leads
 *   PATCH  /api/admin/leads { id, status?, notes? }
 *   DELETE /api/admin/leads?id=...     → removes a lead (e.g. when someone asks to be forgotten)
 */
import { requireAdmin } from "@/lib/server/auth";
import { db, dbEnabled, eq } from "@/lib/server/db";
import { LEAD_STATUSES } from "@/lib/server/leads";

const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!dbEnabled()) return Response.json({ leads: [] });
  const leads = await db("leads?select=*&order=created_at.desc&limit=300");
  return Response.json({ leads });
}

export async function PATCH(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string" || !UUID.test(body.id)) return Response.json({ error: "Invalid lead." }, { status: 400 });
  const patch: Record<string, string> = {};
  if (typeof body.status === "string") {
    if (!(LEAD_STATUSES as readonly string[]).includes(body.status)) return Response.json({ error: "Invalid status." }, { status: 400 });
    patch.status = body.status;
  }
  if (typeof body.notes === "string") patch.notes = body.notes.slice(0, 4000);
  if (!Object.keys(patch).length) return Response.json({ error: "Nothing to update." }, { status: 400 });
  await db(`leads?id=${eq(body.id)}`, { method: "PATCH", body: patch });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!UUID.test(id)) return Response.json({ error: "Invalid lead." }, { status: 400 });
  await db(`leads?id=${eq(id)}`, { method: "DELETE" });
  return Response.json({ ok: true });
}
