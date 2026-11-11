/**
 * POST /api/admin/ai-check: sends one tiny test message to Gemini and reports exactly
 * what Google said. Admin only, because Google's error text can mention your setup.
 */
import { requireAdmin } from "@/lib/server/auth";
import { AiError, aiEnabled, getLastProblem, runAssistant } from "@/lib/server/gemini";

export const maxDuration = 60;

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!aiEnabled()) {
    return Response.json({ ok: false, error: "GEMINI_API_KEY is not set on Vercel. Add it, then redeploy." });
  }

  const started = Date.now();
  try {
    const { reply, model } = await runAssistant({
      system: "You are a connection test. Reply with exactly: OK",
      history: [{ role: "user", text: "Test" }],
      tools: [],
    });
    return Response.json({ ok: true, model, reply: reply.slice(0, 80), ms: Date.now() - started });
  } catch (err) {
    const kind = err instanceof AiError ? err.kind : "failed";
    const hint =
      kind === "config"
        ? "Google rejected the key. Create a new key at aistudio.google.com/apikey, paste it into GEMINI_API_KEY on Vercel (no spaces), then redeploy."
        : kind === "busy"
          ? "Every model is over its free quota right now. It resets daily; try again later or enable billing in Google AI Studio."
          : "Google returned an error. The details below say why.";
    return Response.json({ ok: false, kind, hint, error: err instanceof Error ? err.message : String(err), lastProblem: getLastProblem() });
  }
}
