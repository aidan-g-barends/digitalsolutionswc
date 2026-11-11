/**
 * Admin settings API: the pricing, business info and FAQs the AI uses, and your
 * meeting availability.
 *   GET /api/admin/settings
 *   PUT /api/admin/settings { knowledge?, availability? }
 */
import { requireAdmin } from "@/lib/server/auth";
import { dbEnabled } from "@/lib/server/db";
import { getSettings, saveSetting, type Availability, type Knowledge } from "@/lib/server/settings";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  return Response.json({ ...(await getSettings()), editable: dbEnabled() });
}

export async function PUT(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!dbEnabled()) return Response.json({ error: "Connect the database first (see README)." }, { status: 503 });
  const body = await request.json().catch(() => ({}));

  if (body.knowledge) {
    const k = body.knowledge;
    const text = (v: unknown) => (typeof v === "string" ? v.slice(0, 8000) : "");
    const knowledge: Knowledge = { pricing: text(k.pricing), business: text(k.business), faqs: text(k.faqs) };
    await saveSetting("knowledge", knowledge);
  }

  if (body.availability) {
    const a = body.availability;
    const days = Array.isArray(a.days) ? [...new Set(a.days.filter((d: unknown) => Number.isInteger(d) && (d as number) >= 0 && (d as number) <= 6))] : [];
    const availability: Availability = {
      days: (days as number[]).sort(),
      start: TIME.test(a.start) ? a.start : "09:00",
      end: TIME.test(a.end) ? a.end : "17:00",
      meetingMinutes: [15, 30, 45, 60, 90].includes(a.meetingMinutes) ? a.meetingMinutes : 30,
      minNoticeHours: Math.min(168, Math.max(0, Math.round(Number(a.minNoticeHours) || 0))),
      maxDaysAhead: Math.min(180, Math.max(1, Math.round(Number(a.maxDaysAhead) || 30))),
      inPerson: Boolean(a.inPerson),
      inPersonArea: typeof a.inPersonArea === "string" && a.inPersonArea.trim() ? a.inPersonArea.trim().slice(0, 100) : "the Western Cape",
    };
    if (!availability.days.length) return Response.json({ error: "Choose at least one day." }, { status: 400 });
    if (toMin(availability.end) - toMin(availability.start) < availability.meetingMinutes) {
      return Response.json({ error: "The end time must be at least one meeting after the start time." }, { status: 400 });
    }
    await saveSetting("availability", availability);
  }
  return Response.json({ ok: true, ...(await getSettings()) });
}
