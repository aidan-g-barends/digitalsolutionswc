/**
 * POST /api/chat
 * The AI sales assistant's brain. The browser sends the conversation so far; this
 * route builds the assistant's instructions, lets Gemini call our tools (save lead,
 * check availability, book a meeting), and returns the reply.
 *
 * The Gemini key and database key stay here on the server. The browser never sees them.
 */
import { db, dbEnabled } from "@/lib/server/db";
import { AiError, aiEnabled, runAssistant, type ChatTurn } from "@/lib/server/gemini";
import { buildSystemPrompt } from "@/lib/server/prompt";
import { clientIp, rateLimited } from "@/lib/server/rate";
import { getSettings } from "@/lib/server/settings";
import { buildTools, bookingEnabled } from "@/lib/server/tools";
import { site } from "@/lib/site";

export const maxDuration = 60;

const MAX_TURNS = 60; // a very long chat is better handed to a human
const MAX_CHARS = 1500; // per message

export async function POST(request: Request) {
  if (!aiEnabled()) {
    return Response.json({ error: "offline" }, { status: 503 });
  }

  // Protect the free AI quota: 12 messages a minute and 150 a day per visitor.
  const ip = clientIp(request);
  if (rateLimited(`chat-m:${ip}`, 12, 60_000) || rateLimited(`chat-d:${ip}`, 150, 86_400_000)) {
    return Response.json(
      { error: "You're sending messages very quickly. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  let body: { conversationId?: unknown; messages?: unknown; channel?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(conversationId)) {
    return Response.json({ error: "Invalid conversation." }, { status: 400 });
  }
  const channel = body.channel === "voice" ? "voice" : "text";

  // Clean the history: valid roles only, trimmed, length-capped, last 24 turns.
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const history: ChatTurn[] = raw
    .filter(
      (m): m is ChatTurn =>
        !!m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.text === "string" &&
        m.text.trim().length > 0,
    )
    .map((m) => ({ role: m.role, text: m.text.trim().slice(0, MAX_CHARS) }))
    .slice(-24);

  // Gemini needs the conversation to start with the user and end with the user.
  while (history.length && history[0].role !== "user") history.shift();
  if (!history.length || history[history.length - 1].role !== "user") {
    return Response.json({ error: "Nothing to reply to." }, { status: 400 });
  }
  if (raw.length > MAX_TURNS) {
    return Response.json({
      reply: `We've covered a lot! To take this further properly, please email the team at ${site.email} or use the enquiry form below, and someone will get back to you personally.`,
    });
  }

  // Count this message for the admin stats (no message content is stored).
  if (dbEnabled()) {
    db("rpc/track_conversation", { method: "POST", body: { p_id: conversationId, p_channel: channel } }).catch((err) =>
      console.error("track_conversation failed", err),
    );
  }

  const { knowledge, availability } = await getSettings();
  const system = buildSystemPrompt({ knowledge, availability, channel, bookingEnabled: bookingEnabled() });
  const tools = buildTools({ conversationId, channel: channel === "voice" ? "voice" : "chat", availability });

  try {
    const { reply, toolsUsed } = await runAssistant({ system, history, tools });
    return Response.json({ reply, toolsUsed });
  } catch (err) {
    if (err instanceof AiError && err.kind === "busy") {
      return Response.json(
        { error: `I'm a little overloaded right now. Please try again in a minute, or email us at ${site.email}.` },
        { status: 503 },
      );
    }
    if (err instanceof AiError && err.kind === "config") {
      // Usually a wrong or restricted GEMINI_API_KEY. The owner sees the exact reason
      // under /admin > Overview > "Test the assistant"; visitors get a clear way forward.
      console.error("Chat failed: AI key problem", err.message);
      return Response.json(
        { error: `Our assistant is offline for a moment. Please email us at ${site.email} or use the enquiry form, and we'll reply personally.` },
        { status: 503 },
      );
    }
    console.error("Chat failed", err);
    return Response.json(
      { error: `Sorry, something went wrong on my side. Please try again, or email us at ${site.email}.` },
      { status: 500 },
    );
  }
}
