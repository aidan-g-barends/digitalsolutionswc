/**
 * Tiny Supabase client for the SERVER only (route handlers). Talks to Supabase's
 * REST API with fetch, so there's no extra package to install.
 *
 * Uses the secret service role key, which bypasses Row Level Security. That's why
 * this file must never be imported into a "use client" component: the key would
 * end up in the browser. Only files under src/app/api import it.
 *
 * Env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

export function dbEnabled() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export class DbError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Supabase "Prefer" header, e.g. "return=representation". */
  prefer?: string;
};

/**
 * db("leads?select=*&order=created_at.desc") → rows.
 * Paths are PostgREST paths: table name plus query string filters.
 */
export async function db<T = unknown>(path: string, { method = "GET", body, prefer }: Options = {}): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new DbError("Database is not configured", 503);

  const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json" };
  // Older Supabase projects use a JWT service key, which also goes in Authorization.
  // The newer "sb_secret_..." keys must only be sent in the apikey header.
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  if (prefer) headers.Prefer = prefer;

  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = res.statusText;
    let code: string | undefined;
    try {
      const j = await res.json();
      msg = j.message || msg;
      code = j.code;
    } catch {
      /* not JSON */
    }
    throw new DbError(msg, res.status, code);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Turns a value into a safe PostgREST filter value (eq.xxx). */
export const eq = (v: string) => `eq.${encodeURIComponent(v)}`;
