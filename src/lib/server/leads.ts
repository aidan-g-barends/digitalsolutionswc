/**
 * Saving and updating leads, plus telling you when a good one comes in.
 * Works with or without the database: without Supabase, leads are still emailed to you.
 */
import { db, dbEnabled, eq } from "./db";
import { emailLayout, ownerEmail, sendEmail } from "./email";

export const LEAD_STATUSES = [
  "new",
  "interested",
  "qualified",
  "meeting_requested",
  "meeting_confirmed",
  "converted",
  "not_interested",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type LeadInput = {
  name?: string;
  email?: string;
  phone?: string;
  business_name?: string;
  industry?: string;
  service?: string;
  budget?: string;
  requirements?: string;
  summary?: string;
  status?: LeadStatus;
};

export type Lead = LeadInput & {
  id: string;
  created_at: string;
  updated_at: string;
  source: "chat" | "voice" | "form";
  status: LeadStatus;
  notes?: string | null;
  conversation_id?: string | null;
};

// How "far along" each status is. The AI can move a lead forward, never silently backwards.
const RANK: Record<LeadStatus, number> = {
  not_interested: 0,
  new: 1,
  interested: 2,
  qualified: 3,
  meeting_requested: 4,
  meeting_confirmed: 5,
  converted: 6,
};

const LIMITS: Record<keyof LeadInput, number> = {
  name: 100,
  email: 160,
  phone: 30,
  business_name: 120,
  industry: 80,
  service: 80,
  budget: 60,
  requirements: 1500,
  summary: 1500,
  status: 30,
};

/** Trims and length-limits whatever the AI (or a form) sends, and drops empty values. */
export function cleanLead(input: Record<string, unknown>): LeadInput {
  const out: LeadInput = {};
  for (const k of Object.keys(LIMITS) as (keyof LeadInput)[]) {
    const v = input[k];
    if (typeof v !== "string") continue;
    const t = v.trim().slice(0, LIMITS[k]);
    if (!t) continue;
    if (k === "status") {
      if ((LEAD_STATUSES as readonly string[]).includes(t)) out.status = t as LeadStatus;
    } else if (k === "email") {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) out.email = t.toLowerCase();
    } else {
      out[k] = t;
    }
  }
  return out;
}

const hasContact = (l: LeadInput) => Boolean(l.email || l.phone);

// Without a database we still avoid emailing you the same chat lead over and over.
const notified = new Map<string, Set<string>>();
function shouldNotify(key: string, event: string) {
  const set = notified.get(key) ?? new Set<string>();
  if (set.has(event)) return false;
  set.add(event);
  notified.set(key, set);
  if (notified.size > 2000) notified.clear();
  return true;
}

async function notifyOwner(lead: LeadInput & { source: string }, headline: string) {
  const { html, text } = emailLayout(
    headline,
    [
      ["Name", lead.name ?? ""],
      ["Email", lead.email ?? ""],
      ["Phone", lead.phone ?? ""],
      ["Business", lead.business_name ?? ""],
      ["Industry", lead.industry ?? ""],
      ["Service", lead.service ?? ""],
      ["Budget", lead.budget ?? ""],
      ["Status", (lead.status ?? "new").replace(/_/g, " ")],
      ["Source", lead.source === "form" ? "Contact form" : lead.source === "voice" ? "AI voice assistant" : "AI chat assistant"],
    ],
    [lead.requirements && `Requirements:\n${lead.requirements}`, lead.summary && `Conversation summary:\n${lead.summary}`]
      .filter(Boolean)
      .join("\n\n"),
  );
  await sendEmail({
    to: ownerEmail(),
    subject: `${headline}: ${lead.name || lead.business_name || lead.email || "new contact"}`,
    html,
    text,
    replyTo: lead.email,
  });
}

/**
 * Creates or updates the lead for one AI conversation (one conversation = one lead,
 * so details given over several messages build up a single record).
 */
export async function upsertChatLead(
  conversationId: string,
  channel: "chat" | "voice",
  input: LeadInput,
  { notify = true }: { notify?: boolean } = {},
): Promise<{ id: string | null; status: LeadStatus }> {
  let existing: Lead | null = null;
  if (dbEnabled()) {
    const rows = await db<Lead[]>(`leads?select=*&conversation_id=${eq(conversationId)}&limit=1`);
    existing = rows[0] ?? null;
  }

  // Never let the AI move a lead backwards (e.g. from "meeting confirmed" to "interested").
  let status: LeadStatus = existing?.status ?? "new";
  if (input.status && RANK[input.status] > RANK[status]) status = input.status;
  if (input.status === "not_interested" && RANK[status] <= RANK.interested) status = "not_interested";

  const merged: LeadInput & { source: string } = { ...(existing ?? {}), ...input, status, source: existing?.source ?? channel };
  let id: string | null = existing?.id ?? null;

  if (dbEnabled()) {
    const { status: _s, ...fields } = input;
    void _s;
    if (existing) {
      await db(`leads?id=${eq(existing.id)}`, { method: "PATCH", body: { ...fields, status } });
    } else {
      const [row] = await db<Lead[]>("leads", {
        method: "POST",
        body: { ...fields, status, source: channel, conversation_id: conversationId },
        prefer: "return=representation",
      });
      id = row.id;
      // Link the conversation (for stats) to this lead. Ignore if the row doesn't exist yet.
      await db(`conversations?id=${eq(conversationId)}`, { method: "PATCH", body: { lead_id: id } }).catch(() => {});
    }
  }

  // Email you: when a lead first leaves contact details, and when it becomes qualified.
  const key = id ?? conversationId;
  if (!notify) {
    // The caller sends its own email (e.g. a booking). Mark these as done so we don't send them later.
    shouldNotify(key, "contact");
    shouldNotify(key, "qualified");
  } else if (hasContact(merged) && shouldNotify(key, "contact")) {
    await notifyOwner(merged, "New lead from your website");
  } else if (RANK[status] >= RANK.qualified && (!existing || RANK[existing.status] < RANK.qualified) && shouldNotify(key, "qualified")) {
    await notifyOwner(merged, "Qualified lead from your website");
  }

  return { id, status };
}

/** Saves a contact-form enquiry as a lead (the email to you is sent by the contact route). */
export async function saveFormLead(input: LeadInput) {
  if (!dbEnabled()) return;
  try {
    await db("leads", { method: "POST", body: { ...input, source: "form", status: "interested" } });
  } catch (err) {
    console.error("Could not save form lead", err);
  }
}
