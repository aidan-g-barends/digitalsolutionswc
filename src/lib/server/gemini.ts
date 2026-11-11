/**
 * Calls Google's Gemini API (free tier) with "function calling": the model can ask
 * our server to run tools (save a lead, check availability, book a meeting), we run
 * them, send the results back, and the model writes its reply. Server only.
 *
 * Env vars: GEMINI_API_KEY (required), GEMINI_MODEL (optional, default gemini-2.5-flash)
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
}): Promise<{ reply: string; toolsUsed: string[] }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError("GEMINI_API_KEY is not set", "config");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const contents: Content[] = history.map((t) => ({
    role: t.role === "assistant" ? "model" : "user",
    parts: [{ text: t.text }],
  }));
  const toolsUsed: string[] = [];

  for (let step = 0; step < maxSteps; step++) {
    const body: Record<string, unknown> = {
      systemInstruction: { parts: [{ text: system }] },
      contents,
      tools: [{ functionDeclarations: tools.map(({ name, description, parameters }) => ({ name, description, parameters })) }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        // 2.5 Flash "thinks" by default. A sales chat doesn't need it: switching it off
        // makes replies faster and stretches the free quota.
        ...(/2\.5-flash/.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    };

    let res: Response;
    try {
      // GEMINI_API_BASE is only for local testing against a mock server.
      const base = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";
      res = await fetch(`${base}/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(25_000),
      });
    } catch (err) {
      console.error("Gemini request failed", err);
      throw new AiError("AI request failed", "failed");
    }
    if (res.status === 429 || res.status === 503) throw new AiError("AI is busy", "busy");
    if (!res.ok) {
      console.error("Gemini error", res.status, await res.text());
      throw new AiError("AI request failed", "failed");
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const parts: Part[] = candidate?.content?.parts ?? [];
    const calls = parts.filter((p) => p.functionCall);

    if (!calls.length) {
      const reply = parts
        .map((p) => p.text ?? "")
        .join("")
        .trim();
      if (!reply) throw new AiError(`Empty reply (${candidate?.finishReason ?? "unknown"})`, "failed");
      return { reply, toolsUsed };
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
