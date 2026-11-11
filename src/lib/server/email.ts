/**
 * Sends email through Resend (https://resend.com). Server only.
 *
 * Env vars:
 *   RESEND_API_KEY      required to send anything
 *   CONTACT_TO_EMAIL    where notifications go (defaults to the email in site.ts)
 *   CONTACT_FROM_EMAIL  sender. While this is empty, Resend's shared test sender is used,
 *                       which can ONLY deliver to the email your Resend account uses.
 *                       So customer confirmations need a verified domain (see README).
 */
import { site } from "@/lib/site";

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const ownerEmail = () => process.env.CONTACT_TO_EMAIL || site.email;

/** True only when emails to customers (not just to you) can actually be delivered. */
export const canEmailCustomers = () => Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL);

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return false;
  const from = process.env.CONTACT_FROM_EMAIL || `${site.name} <onboarding@resend.dev>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend request failed", err);
    return false;
  }
}

/** A simple, readable email: a title, a table of details and an optional paragraph. */
export function emailLayout(title: string, rows: [string, string][], body?: string) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;color:#111">
      <h2 style="margin:0 0 16px">${esc(title)}</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#666;width:130px;vertical-align:top">${esc(k)}</td><td style="padding:6px 0"><strong>${esc(v || "-")}</strong></td></tr>`,
          )
          .join("")}
      </table>
      ${body ? `<p style="white-space:pre-wrap;line-height:1.5;margin-top:20px">${esc(body)}</p>` : ""}
    </div>`;
  const text = `${title}\n\n${rows.map(([k, v]) => `${k}: ${v || "-"}`).join("\n")}${body ? `\n\n${body}` : ""}`;
  return { html, text };
}
