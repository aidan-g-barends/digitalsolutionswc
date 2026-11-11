/**
 * Business settings the AI assistant relies on, editable from /admin.
 * Stored in the Supabase "settings" table; sensible defaults are used until you save your own.
 */
import { db, dbEnabled } from "./db";

export type Knowledge = {
  /** Approved pricing. While empty, the AI will NOT quote any prices. */
  pricing: string;
  /** Extra business info: turnaround times, what's included, hosting, support, etc. */
  business: string;
  /** Common questions and approved answers. */
  faqs: string;
};

export type Availability = {
  /** Days you take meetings: 0 = Sunday ... 6 = Saturday. */
  days: number[];
  start: string; // "09:00"
  end: string; // "17:00"
  meetingMinutes: number;
  minNoticeHours: number;
  maxDaysAhead: number;
  inPerson: boolean;
  /** Where in-person meetings can happen, in your words. */
  inPersonArea: string;
};

export const defaultKnowledge: Knowledge = { pricing: "", business: "", faqs: "" };

export const defaultAvailability: Availability = {
  days: [1, 2, 3, 4, 5],
  start: "09:00",
  end: "17:00",
  meetingMinutes: 30,
  minNoticeHours: 12,
  maxDaysAhead: 30,
  inPerson: true,
  inPersonArea: "the Western Cape",
};

type Settings = { knowledge: Knowledge; availability: Availability };

// Cached for a minute so every chat message doesn't hit the database.
let cache: { at: number; value: Settings } | null = null;

export async function getSettings(): Promise<Settings> {
  if (cache && Date.now() - cache.at < 60_000) return cache.value;
  const value: Settings = { knowledge: { ...defaultKnowledge }, availability: { ...defaultAvailability } };
  if (dbEnabled()) {
    try {
      const rows = await db<{ key: string; value: unknown }[]>("settings?select=key,value");
      for (const r of rows) {
        if (r.key === "knowledge") value.knowledge = { ...defaultKnowledge, ...(r.value as Partial<Knowledge>) };
        if (r.key === "availability") value.availability = { ...defaultAvailability, ...(r.value as Partial<Availability>) };
      }
    } catch (err) {
      console.error("Could not load settings, using defaults", err);
    }
  }
  cache = { at: Date.now(), value };
  return value;
}

export async function saveSetting(key: keyof Settings, value: Knowledge | Availability) {
  await db("settings", {
    method: "POST",
    body: { key, value, updated_at: new Date().toISOString() },
    prefer: "resolution=merge-duplicates",
  });
  cache = null;
}
