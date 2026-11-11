/**
 * The actions the AI assistant is allowed to take. Each tool validates its own
 * input, because the AI's arguments are treated like any other untrusted input.
 */
import { bookMeeting, nextOpenDays, openTimes, prettyDate } from "./booking";
import { dbEnabled } from "./db";
import type { Tool } from "./gemini";
import { LEAD_STATUSES, cleanLead, upsertChatLead } from "./leads";
import type { Availability } from "./settings";

/** Online booking needs the database (that's what prevents double bookings). */
export function bookingEnabled() {
  return dbEnabled();
}

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function buildTools({
  conversationId,
  channel,
  availability,
}: {
  conversationId: string;
  channel: "chat" | "voice";
  availability: Availability;
}): Tool[] {
  const saveLead: Tool = {
    name: "save_lead",
    description:
      "Save or update the potential client's details for this conversation. Call it whenever you learn something useful, and again as you learn more. Always include a short summary of what they need.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Their full name" },
        email: { type: "string" },
        phone: { type: "string" },
        business_name: { type: "string" },
        industry: { type: "string", description: "e.g. plumbing, restaurant, salon, retail" },
        service: { type: "string", description: "The service they're interested in" },
        budget: { type: "string", description: "Only if they offered it" },
        requirements: { type: "string", description: "What they want built, in a few sentences" },
        summary: { type: "string", description: "2 to 4 sentence summary of the conversation and their needs" },
        status: { type: "string", enum: LEAD_STATUSES.filter((s) => s !== "meeting_confirmed" && s !== "converted") },
      },
    },
    run: async (args) => {
      const lead = cleanLead(args);
      if (!Object.keys(lead).length) return { saved: false, error: "No usable details were given." };
      const { status } = await upsertChatLead(conversationId, channel, lead);
      return { saved: true, status };
    },
  };

  if (!bookingEnabled()) return [saveLead];

  const checkAvailability: Tool = {
    name: "check_availability",
    description:
      "Get the real open consultation times for a date. Always call this before offering or booking a time. Work out the date from what the client says (e.g. 'next Tuesday') using today's date.",
    parameters: {
      type: "object",
      properties: { date: { type: "string", description: "YYYY-MM-DD" } },
      required: ["date"],
    },
    run: async (args) => {
      const date = str(args.date, 10);
      const { times, reason } = await openTimes(date, availability);
      if (times.length) return { date, day: prettyDate(date), open_times: times, meeting_minutes: availability.meetingMinutes };
      return { date, open_times: [], reason, next_days_with_open_times: await nextOpenDays(date, availability) };
    },
  };

  const book: Tool = {
    name: "book_meeting",
    description:
      "Book a free consultation in an open time from check_availability. Only call this once the client has given their name, email, phone, service, date, time and online/in-person, and agreed to book.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        service: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD" },
        time: { type: "string", description: "HH:MM, 24-hour, exactly as returned by check_availability" },
        mode: { type: "string", enum: ["online", "in_person"] },
        notes: { type: "string", description: "Anything useful for the meeting" },
      },
      required: ["name", "email", "phone", "service", "date", "time", "mode"],
    },
    run: async (args) => {
      const req = {
        name: str(args.name, 100),
        email: str(args.email, 160).toLowerCase(),
        phone: str(args.phone, 30),
        service: str(args.service, 80),
        date: str(args.date, 10),
        time: str(args.time, 5),
        mode: args.mode === "in_person" ? ("in_person" as const) : ("online" as const),
        notes: str(args.notes, 800) || undefined,
      };
      const missing: string[] = [];
      if (req.name.length < 2) missing.push("name");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(req.email)) missing.push("a valid email");
      if (!/^[+()\d\s-]{7,20}$/.test(req.phone)) missing.push("a valid phone number");
      if (!req.service) missing.push("service");
      if (!/^\d{2}:\d{2}$/.test(req.time)) missing.push("time (HH:MM)");
      if (missing.length) return { status: "not_booked", message: `Still needed: ${missing.join(", ")}.` };
      return bookMeeting(req, availability, { conversationId, channel });
    },
  };

  return [saveLead, checkAvailability, book];
}
