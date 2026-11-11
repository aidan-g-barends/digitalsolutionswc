/**
 * Consultation booking: works out real open times and books them safely.
 *
 * Open times = your working days/hours (set in /admin)
 *              minus meetings already booked (database)
 *              minus busy time in your Google Calendar (if connected)
 *              minus anything sooner than your minimum notice.
 * Double bookings are impossible: the database refuses a second booking at the same
 * time (unique index in supabase/setup.sql), even if two people click at once.
 */
import { site } from "@/lib/site";
import { db, DbError } from "./db";
import { canEmailCustomers, emailLayout, ownerEmail, sendEmail } from "./email";
import { busyTimes, calendarEnabled, createEvent } from "./google";
import { upsertChatLead } from "./leads";
import type { Availability } from "./settings";

// South Africa is UTC+2 all year (no daylight saving), so times are simple to convert.
const OFFSET = "+02:00";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "2026-11-13" + "10:00" → the exact moment in time, in South African time. */
export const saTime = (date: string, time: string) => new Date(`${date}T${time}:00${OFFSET}`);

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const hhmm = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

/** Today's date in South Africa, as YYYY-MM-DD. */
export const todaySA = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(new Date());

export function prettyDate(date: string, time?: string) {
  const d = saTime(date, time ?? "12:00");
  const day = new Intl.DateTimeFormat("en-ZA", { timeZone: "Africa/Johannesburg", weekday: "long", day: "numeric", month: "long" }).format(d);
  return time ? `${day} at ${time}` : day;
}

function addDays(date: string, n: number) {
  const d = saTime(date, "12:00");
  d.setUTCDate(d.getUTCDate() + n);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(d);
}

type Busy = { start: Date; end: Date };

/** Every bookable start time on one date, before checking what's already taken. */
function candidateTimes(date: string, a: Availability) {
  const weekday = saTime(date, "12:00").getUTCDay();
  if (!a.days.includes(weekday)) return [];
  const out: string[] = [];
  for (let m = minutes(a.start); m + a.meetingMinutes <= minutes(a.end); m += a.meetingMinutes) out.push(hhmm(m));
  return out;
}

export async function openTimes(date: string, a: Availability): Promise<{ times: string[]; reason?: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(saTime(date, "12:00").getTime())) {
    return { times: [], reason: "Invalid date. Use the format YYYY-MM-DD." };
  }
  const today = todaySA();
  if (date < today) return { times: [], reason: "That date is in the past." };
  if (date > addDays(today, a.maxDaysAhead)) return { times: [], reason: `Bookings open up to ${a.maxDaysAhead} days ahead.` };

  const candidates = candidateTimes(date, a);
  if (!candidates.length) {
    return { times: [], reason: `We don't take meetings on ${DAYS[saTime(date, "12:00").getUTCDay()]}s.` };
  }

  const dayStart = saTime(date, "00:00");
  const dayEnd = saTime(date, "23:59");
  const booked = await db<{ starts_at: string; ends_at: string }[]>(
    `bookings?select=starts_at,ends_at&status=eq.confirmed&starts_at=gte.${encodeURIComponent(dayStart.toISOString())}&starts_at=lte.${encodeURIComponent(dayEnd.toISOString())}`,
  );
  const busy: Busy[] = booked.map((b) => ({ start: new Date(b.starts_at), end: new Date(b.ends_at) }));
  if (calendarEnabled()) {
    try {
      busy.push(...(await busyTimes(dayStart, dayEnd)));
    } catch (err) {
      console.error("Google Calendar check failed; using database bookings only", err);
    }
  }

  const earliest = Date.now() + a.minNoticeHours * 3_600_000;
  const soonEnough = candidates.filter((t) => saTime(date, t).getTime() >= earliest);
  if (!soonEnough.length) {
    return { times: [], reason: `That's too soon: consultations need at least ${a.minNoticeHours} hours' notice.` };
  }
  const times = soonEnough.filter((t) => {
    const s = saTime(date, t);
    const e = new Date(s.getTime() + a.meetingMinutes * 60_000);
    return !busy.some((b) => s < b.end && e > b.start); // overlaps an existing meeting or calendar event
  });
  return { times, reason: times.length ? undefined : "That day is fully booked." };
}

/** The next few days that still have open times, to suggest alternatives. */
export async function nextOpenDays(from: string, a: Availability, count = 3) {
  const out: { date: string; day: string; times: string[] }[] = [];
  for (let i = 0; i <= a.maxDaysAhead && out.length < count; i++) {
    const date = addDays(from, i);
    if (!candidateTimes(date, a).length) continue;
    const { times } = await openTimes(date, a);
    if (times.length) out.push({ date, day: prettyDate(date), times: times.slice(0, 6) });
  }
  return out;
}

export type BookingRequest = {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  mode: "online" | "in_person";
  notes?: string;
};

export async function bookMeeting(
  req: BookingRequest,
  a: Availability,
  ctx: { conversationId: string; channel: "chat" | "voice" },
): Promise<Record<string, unknown>> {
  // 1. Is the time genuinely open right now?
  const { times, reason } = await openTimes(req.date, a);
  if (!times.includes(req.time)) {
    return {
      status: "unavailable",
      message: reason ?? "That time isn't available.",
      open_times_that_day: times,
      suggestions: times.length ? undefined : await nextOpenDays(req.date, a),
    };
  }
  if (req.mode === "in_person" && !a.inPerson) req.mode = "online";

  const start = saTime(req.date, req.time);
  const end = new Date(start.getTime() + a.meetingMinutes * 60_000);

  const contact = { name: req.name, email: req.email, phone: req.phone, service: req.service };

  // 2. Insert the booking. The unique index rejects it if someone took the slot a moment ago.
  let bookingId: string;
  try {
    const [row] = await db<{ id: string }[]>("bookings", {
      method: "POST",
      body: {
        name: req.name,
        email: req.email,
        phone: req.phone,
        service: req.service,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        mode: req.mode,
        notes: req.notes,
        status: "confirmed",
      },
      prefer: "return=representation",
    });
    bookingId = row.id;
  } catch (err) {
    if (err instanceof DbError && (err.status === 409 || err.code === "23505")) {
      // Keep their details as a lead that still wants a meeting, so they're not lost.
      await upsertChatLead(ctx.conversationId, ctx.channel, { ...contact, status: "meeting_requested" });
      return { status: "unavailable", message: "Someone just booked that time. Please choose another.", open_times_that_day: (await openTimes(req.date, a)).times };
    }
    throw err;
  }

  // 3. Only now that the slot is really theirs: mark the lead "meeting confirmed" and link it.
  //    (No separate lead email: the booking email below covers it.)
  const lead = await upsertChatLead(ctx.conversationId, ctx.channel, { ...contact, status: "meeting_confirmed" }, { notify: false });
  if (lead.id) await db(`bookings?id=eq.${bookingId}`, { method: "PATCH", body: { lead_id: lead.id } });

  const when = `${prettyDate(req.date, req.time)} (SAST)`;
  const how =
    req.mode === "online"
      ? "Online video call. We'll email you the meeting link before the meeting."
      : `In person in ${a.inPersonArea}. We'll email you to confirm the exact place.`;

  // 4. Add to Google Calendar (optional). A failure here doesn't undo the booking.
  let calendar = false;
  if (calendarEnabled()) {
    try {
      const eventId = await createEvent({
        summary: `Consultation: ${req.name}${req.service ? ` (${req.service})` : ""}`,
        description: `Booked via the website AI assistant.\n\nName: ${req.name}\nEmail: ${req.email}\nPhone: ${req.phone}\nService: ${req.service}\nMode: ${req.mode === "online" ? "Online" : "In person"}${req.notes ? `\nNotes: ${req.notes}` : ""}`,
        start,
        end,
      });
      await db(`bookings?id=eq.${bookingId}`, { method: "PATCH", body: { google_event_id: eventId } });
      calendar = true;
    } catch (err) {
      console.error("Could not add booking to Google Calendar", err);
    }
  }

  // 5. Tell you, and (if your sending domain is set up) the client.
  const rows: [string, string][] = [
    ["When", when],
    ["Length", `${a.meetingMinutes} minutes`],
    ["How", req.mode === "online" ? "Online" : "In person"],
    ["Name", req.name],
    ["Email", req.email],
    ["Phone", req.phone],
    ["Service", req.service],
  ];
  const owner = emailLayout("New consultation booked", rows, req.notes ? `Notes:\n${req.notes}` : undefined);
  await sendEmail({ to: ownerEmail(), subject: `Consultation booked: ${req.name}, ${prettyDate(req.date, req.time)}`, ...owner, replyTo: req.email });

  let confirmationSent = false;
  if (canEmailCustomers()) {
    const mail = emailLayout(
      `Your consultation with ${site.name} is booked`,
      rows.slice(0, 3),
      `Hi ${req.name.split(" ")[0]},\n\nThanks for booking a free consultation. ${how}\n\nNeed to change the time? Just reply to this email.\n\n${site.name}`,
    );
    confirmationSent = await sendEmail({ to: req.email, subject: `Booked: your consultation on ${prettyDate(req.date, req.time)}`, ...mail, replyTo: ownerEmail() });
  }

  return {
    status: "confirmed",
    when,
    length_minutes: a.meetingMinutes,
    mode: req.mode,
    what_happens_next: how,
    confirmation_email_sent: confirmationSent,
    added_to_calendar: calendar,
    note: confirmationSent
      ? "A confirmation email was sent to the client."
      : "No confirmation email was sent to the client; tell them the team will be in touch by email to confirm.",
  };
}
