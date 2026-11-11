/**
 * Calls Google's Gemini API (free tier) with "function calling": the model can ask
 * our server to run tools (save a lead, check availability, book a meeting), we run
 * them, send the results back, and the model writes its reply. Server only.
 *
 * Env vars: GEMINI_API_KEY (required), GEMINI_MODEL (optional)
 *
 * Reliability: Google retires model versions and gives each free-tier model its own daily
 * quota. So instead of depending on one model name, we try a short chain of models and
 * remember the one that works. Key problems are reported clearly instead of as "failed".
 */

export type ChatTurn = { role: "user" | "assistant"; text: string };

export type Tool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON-schema-like object, as Gemini expects
  run: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

type Part = { text?: string; functionCall?: { name: string; args?: Record<string, unknown> }; [k: string]: unknown };
type Content = { role: "user" | "model"; parts: Part[] };

export class AiError extends Error {
  constructor(
    message: string,
    public kind: "config" | "busy" | "failed",
  ) {
    super(message);
  }
}

export function aiEnabled() {
  return Boolean(process.env.GEMINI_API_KEY);
}

// Tried in order after GEMINI_MODEL. The "-latest" aliases are kept current by Google,
// so the chain keeps working when a dated version is retired.
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-flash-lite-latest"];

// The last model that answered. Tried first next time, so we don't repeat failed attempts.
let workingModel: string | null = null;

/** The most recent problem Google reported, for the admin "Test the assistant" check. */
export type AiProblem = { at: string; model: string; status: number; message: string };
let lastProblem: AiProblem | null = null;
export const getLastProblem = () => lastProblem;
export const getWorkingModel = () => workingModel;

function modelChain() {
  const preferred = process.env.GEMINI_MODEL?.trim();
  return [...new Set([workingModel, preferred, ...FALLBACK_MODELS].filter((m): m is string => !!m))];
}

/** Pulls Google's human-readable message out of an error response. */
function googleMessage(raw: string) {
  try {
    const j = JSON.parse(raw);
    const e = Array.isArray(j) ? j[0]?.error : j.error;
    return [e?.status, e?.message].filter(Boolean).join(": ") || raw.slice(0, 300);
  } catch {
    return raw.slice(0, 300);
  }
}

/** 2.5 Flash "thinks" by default. A sales chat doesn't need it: off is faster and saves quota. */
const canSkipThinking = (model: string) => /2\.5-flash/.test(model);

type Attempt = { ok: true; data: Record<string, unknown>; model: string } | { ok: false; kind: AiError["kind"]; message: string };

/**
 * Sends one request, walking the model chain until a model answers.
 * - Key/permission problems stop immediately (another model won't help).
 * - Retired/unknown models, per-model quota limits and server errors move on to the next model.
 */
async function generate(key: string, body: Record<string, unknown>): Promise<Attempt> {
  const base = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";
  let last: Attempt = { ok: false, kind: "failed", message: "No model answered." };
  let allBusy = true;

  for (const model of modelChain()) {
    const generationConfig = {
      temperature: 0.7,
      ...(canSkipThinking(model) ? { maxOutputTokens: 800, thinkingConfig: { thinkingBudget: 0 } } : { maxOutputTokens: 4096 }),
    };
    let res: Response;
    try {
      res = await fetch(`${base}/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ ...body, generationConfig }),
        signal: AbortSignal.timeout(25_000),
      });
    } catch (err) {
      console.error(`Gemini request to ${model} failed`, err);
      allBusy = false;
      last = { ok: false, kind: "failed", message: `Could not reach Google (${model}).` };
      continue;
    }

    if (res.ok) {
      workingModel = model;
      return { ok: true, data: await res.json(), model };
    }

    const message = googleMessage(await res.text());
    lastProblem = { at: new Date().toISOString(), model, status: res.status, message };
    console.error("Gemini error", model, res.status, message);
    if (workingModel === model) workingModel = null;

    // A bad, restricted or unauthorised key: no other model will work either.
    if (res.status === 401 || res.status === 403 || /API_KEY|api key/i.test(message)) {
      return { ok: false, kind: "config", message };
    }
    if (res.status !== 429 && res.status !== 503) allBusy = false;
    last = { ok: false, kind: res.status === 429 || res.status === 503 ? "busy" : "failed", message };
  }
  return allBusy && last.ok === false ? { ...last, kind: "busy" } : last;
}

export async function runAssistant({
  system,
  history,
  tools,
  maxSteps = 4,
}: {
  system: string;
  history: ChatTurn[];
  tools: Tool[];
  maxSteps?: number;
}): Promise<{ reply: string; toolsUsed: string[]; model: string }> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new AiError("GEMINI_API_KEY is not set", "config");

  const contents: Content[] = history.map((t) => ({
    role: t.role === "assistant" ? "model" : "user",
    parts: [{ text: t.text }],
  }));
  const toolsUsed: string[] = [];

  for (let step = 0; step < maxSteps; step++) {
    const body: Record<string, unknown> = {
      systemInstruction: { parts: [{ text: system }] },
      contents,
      // An empty tool list is rejected by the API, so only send tools when there are some.
      ...(tools.length
        ? { tools: [{ functionDeclarations: tools.map(({ name, description, parameters }) => ({ name, description, parameters })) }] }
        : {}),
    };

    const attempt = await generate(key, body);
    if (!attempt.ok) throw new AiError(attempt.message, attempt.kind);
    const data = attempt.data as { candidates?: { content?: { parts?: Part[] }; finishReason?: string }[] };
    const candidate = data.candidates?.[0];
    const parts: Part[] = candidate?.content?.parts ?? [];
    const calls = parts.filter((p) => p.functionCall);

    if (!calls.length) {
      const reply = parts
        .map((p) => p.text ?? "")
        .join("")
        .trim();
      if (!reply) throw new AiError(`Empty reply (${candidate?.finishReason ?? "unknown"})`, "failed");
      return { reply, toolsUsed, model: attempt.model };
    }

    // The model wants tools run. Keep its turn exactly as sent (it can include
    // signatures the API needs back), run each tool, then return the results.
    contents.push({ role: "model", parts });
    const responses: Part[] = [];
    for (const p of calls) {
      const { name, args = {} } = p.functionCall!;
      const tool = tools.find((t) => t.name === name);
      let result: Record<string, unknown>;
      try {
        result = tool ? await tool.run(args) : { error: `Unknown tool ${name}` };
      } catch (err) {
        console.error(`Tool ${name} failed`, err);
        result = { error: "This action failed on our side. Do not claim it worked." };
      }
      toolsUsed.push(name);
      responses.push({ functionResponse: { name, response: result } });
    }
    contents.push({ role: "user", parts: responses });
  }

  throw new AiError("Too many tool steps", "failed");
}
