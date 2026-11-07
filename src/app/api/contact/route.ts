/**
 * POST /api/contact
 * Receives the enquiry form, validates it on the server, and emails it to you
 * through Resend (https://resend.com). Replying to that email replies to the client.
 *
 * Needs these environment variables on Vercel:
 *   RESEND_API_KEY      your Resend API key (required)
 *   CONTACT_TO_EMAIL    where enquiries go (defaults to the email in site.ts)
 *   CONTACT_FROM_EMAIL  sender; defaults to Resend's test sender, which can only
 *                       deliver to the email your Resend account was created with
 */
import { validateEnquiry, type Enquiry } from "@/lib/enquiry";
import { site } from "@/lib/site";

// Basic spam protection: max 5 enquiries per IP every 10 minutes.
// (In-memory, so it resets when Vercel starts a fresh server. Good enough for a contact form.)
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

// Stops anyone injecting HTML into the email you receive.
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: a hidden field real people never fill in. Bots do, so pretend it worked.
  if (typeof body.website === "string" && body.website.length > 0) {
    return Response.json({ ok: true });
  }

  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : "");
  const data: Enquiry = {
    name: str("name").trim(),
    business: str("business").trim(),
    email: str("email").trim(),
    phone: str("phone").trim(),
    service: str("service"),
    message: str("message").trim(),
    budget: str("budget"),
  };

  const errors = validateEnquiry(data);
  if (Object.keys(errors).length) {
    return Response.json({ error: "Please fix the highlighted fields.", errors }, { status: 422 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many enquiries. Please try again in a few minutes." }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;
  const from = process.env.CONTACT_FROM_EMAIL || `${site.name} <onboarding@resend.dev>`;
  if (!apiKey || !to) {
    console.error("Contact form is not configured: set RESEND_API_KEY (and CONTACT_TO_EMAIL).");
    return Response.json({ error: "Our form is temporarily unavailable." }, { status: 503 });
  }

  const rows: [string, string][] = [
    ["Name", data.name],
    ["Business", data.business || "-"],
    ["Email", data.email],
    ["Phone", data.phone || "-"],
    ["Service", data.service],
    ["Budget", data.budget || "-"],
  ];
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="margin:0 0 16px">New project enquiry</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 12px 6px 0;color:#666;width:110px">${k}</td><td style="padding:6px 0"><strong>${esc(v)}</strong></td></tr>`,
          )
          .join("")}
      </table>
      <h3 style="margin:24px 0 8px">Project</h3>
      <p style="white-space:pre-wrap;line-height:1.5">${esc(data.message)}</p>
    </div>`;
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nProject:\n${data.message}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `New enquiry: ${data.service} from ${data.name}${data.business ? ` (${data.business})` : ""}`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text());
      return Response.json({ error: "We couldn't send your enquiry. Please try again." }, { status: 502 });
    }
  } catch (err) {
    console.error("Resend request failed", err);
    return Response.json({ error: "We couldn't send your enquiry. Please try again." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
