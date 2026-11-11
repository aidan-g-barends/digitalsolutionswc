/**
 * Admin meetings API.
 *   GET   /api/admin/bookings                 → recent and upcoming meetings
 *   PATCH /api/admin/bookings { id, status }  → confirmed / cancelled / completed
 * Cancelling frees the time slot again and removes the Google Calendar event.
 */
import { requireAdmin } from "@/lib/server/auth";
import { db, dbEnabled, eq } from "@/lib/server/db";
import { deleteEvent } from "@/lib/server/google";

const STATUSES = ["confirmed", "cancelled", "completed"];

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!dbEnabled()) return Response.json({ bookings: [] });
  const from = new Date(Date.now() - 60 * 86_400_000).toISOString();
  const bookings = await db(`bookings?select=*&starts_at=gte.${encodeURIComponent(from)}&order=starts_at.asc&limit=300`);
  return Response.json({ bookings });
}

export async function PATCH(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id) || !STATUSES.includes(body.status)) {
    return Response.json({ error: "Invalid update." }, { status: 400 });
  }
  const [row] = await db<{ google_event_id: string | null; lead_id: string | null }[]>(
    `bookings?id=${eq(body.id)}&select=google_event_id,lead_id`,
  );
  if (!row) return Response.json({ error: "Meeting not found." }, { status: 404 });
  try {
    await db(`bookings?id=${eq(body.id)}`, { method: "PATCH", body: { status: body.status } });
  } catch {
    // Re-confirming a cancelled meeting whose time has since been taken.
    return Response.json({ error: "That time has been booked by someone else." }, { status: 409 });
  }
  if (body.status === "cancelled" && row.google_event_id) {
    await deleteEvent(row.google_event_id).catch((err) => console.error("Could not delete calendar event", err));
  }
  return Response.json({ ok: true });
}
