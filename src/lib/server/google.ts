/**
 * Optional Google Calendar sync, using a Google Cloud "service account" (a robot
 * Google account the website signs in as). When set up:
 *  - busy times in your calendar are treated as unavailable for bookings
 *  - every booking is added to your calendar as an event
 * Without these env vars, booking still works using the database only.
 *
 * Env vars (see README for setup):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  e.g. dswc-bookings@your-project.iam.gserviceaccount.com
 *   GOOGLE_PRIVATE_KEY            the private_key from the service account's JSON key file
 *   GOOGLE_CALENDAR_ID            your calendar's ID (often your Gmail address), shared with
 *                                 the service account with "Make changes to events"
 */
import { createSign } from "node:crypto";

export function calendarEnabled() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CALENDAR_ID);
}

let token: { value: string; expires: number } | null = null;

const b64url = (input: string | Buffer) => Buffer.from(input).toString("base64url");

/** Signs a short-lived JWT with the service account key and swaps it for an access token. */
async function accessToken() {
  if (token && Date.now() < token.expires - 60_000) return token.value;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  // Vercel stores multi-line values with literal "\n"; turn them back into real newlines.
  const key = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(key);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${b64url(signature)}`,
    }),
  });
  if (!res.ok) throw new Error(`Google auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return token.value;
}

const calendarId = () => encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!);

/** Busy periods in your calendar between two times. */
export async function busyTimes(from: Date, to: Date): Promise<{ start: Date; end: Date }[]> {
  if (!calendarEnabled()) return [];
  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      timeZone: "Africa/Johannesburg",
      items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
    }),
  });
  if (!res.ok) throw new Error(`Google freeBusy failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const busy: { start: string; end: string }[] = data.calendars?.[process.env.GOOGLE_CALENDAR_ID!]?.busy ?? [];
  return busy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

/** Adds the booking to your calendar. Returns the event ID. */
export async function createEvent(e: { summary: string; description: string; start: Date; end: Date; location?: string }) {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId()}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: e.summary,
      description: e.description,
      location: e.location,
      start: { dateTime: e.start.toISOString(), timeZone: "Africa/Johannesburg" },
      end: { dateTime: e.end.toISOString(), timeZone: "Africa/Johannesburg" },
      reminders: { useDefault: true },
    }),
  });
  if (!res.ok) throw new Error(`Google create event failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.id as string;
}

/** Removes a cancelled booking from your calendar. */
export async function deleteEvent(eventId: string) {
  if (!calendarEnabled()) return;
  await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId()}/events/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${await accessToken()}` },
  });
}
