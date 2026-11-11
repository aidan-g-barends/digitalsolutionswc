"use client";

/**
 * /admin: your private dashboard. Leads, meetings, what the AI knows, and your
 * availability. All data comes from /api/admin/*, which checks the login cookie
 * on every request, so nothing here is visible to visitors.
 */
import { Check, ChevronDown, Loader2, LogOut, RefreshCw, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

type Lead = {
  id: string;
  created_at: string;
  source: "chat" | "voice" | "form";
  status: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  business_name?: string | null;
  industry?: string | null;
  service?: string | null;
  budget?: string | null;
  requirements?: string | null;
  summary?: string | null;
  notes?: string | null;
};
type Booking = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  starts_at: string;
  ends_at: string;
  mode: "online" | "in_person";
  status: "confirmed" | "cancelled" | "completed";
  notes?: string | null;
};
type Knowledge = { pricing: string; business: string; faqs: string };
type Availability = {
  days: number[];
  start: string;
  end: string;
  meetingMinutes: number;
  minNoticeHours: number;
  maxDaysAhead: number;
  inPerson: boolean;
  inPersonArea: string;
};
type Overview = {
  setup: { ai: boolean; database: boolean; email: boolean; customerEmails: boolean; calendar: boolean };
  stats: null | {
    totalLeads: number;
    leads30: number;
    bySource30: { chat: number; voice: number; form: number };
    byStatus: Record<string, number>;
    conversations30: number;
    voiceConversations30: number;
    chatConversion30: number;
    upcomingMeetings: number;
    converted: number;
  };
};

const STATUSES = [
  ["new", "New lead"],
  ["interested", "Interested"],
  ["qualified", "Qualified"],
  ["meeting_requested", "Meeting requested"],
  ["meeting_confirmed", "Meeting confirmed"],
  ["converted", "Converted customer"],
  ["not_interested", "Not interested"],
] as const;
const statusLabel = (s: string) => STATUSES.find(([k]) => k === s)?.[1] ?? s;
const STATUS_TONE: Record<string, string> = {
  new: "bg-paper-3 text-soft",
  interested: "bg-signal/10 text-signal",
  qualified: "bg-signal/20 text-signal",
  meeting_requested: "bg-amber-500/15 text-amber-500",
  meeting_confirmed: "bg-ok/15 text-ok",
  converted: "bg-ok text-white",
  not_interested: "bg-paper-3 text-mute line-through",
};
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmt = (iso: string, withTime = true) =>
  new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    weekday: "short",
  }).format(new Date(iso));

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed"), { status: res.status });
  return data as T;
}

export default function AdminPage() {
  const [session, setSession] = useState<{ configured: boolean; signedIn: boolean } | null>(null);

  const check = useCallback(async () => {
    setSession(await api("/api/admin/session"));
  }, []);
  useEffect(() => {
    // Checking the session needs the browser's cookie, so it runs after the first render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    check().catch(() => setSession({ configured: false, signedIn: false }));
  }, [check]);

  if (!session) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-mute" />
      </div>
    );
  }
  if (!session.signedIn) return <Login configured={session.configured} onDone={check} />;
  return <Dashboard onLogout={() => setSession({ configured: true, signedIn: false })} />;
}

function Login({ configured, onDone }: { configured: boolean; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
            onDone();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
        className="w-full max-w-sm rounded-[14px] border border-line-strong bg-paper-2 p-8"
      >
        <p className="annot text-mute">Digital Solutions WC</p>
        <h1 className="display mt-3 text-5xl">Admin</h1>
        {!configured && (
          <p className="mt-5 rounded-[5px] bg-danger/10 p-3 text-sm text-danger">
            The dashboard isn&apos;t set up yet. Add an <code>ADMIN_PASSWORD</code> environment variable on Vercel and redeploy.
          </p>
        )}
        <label htmlFor="pw" className="mt-8 block text-sm text-soft">
          Password
        </label>
        <input
          id="pw"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-[5px] border border-line-strong bg-paper px-3 py-3 text-ink"
          autoFocus
        />
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <button
          disabled={busy || !password || !configured}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[5px] bg-signal font-medium text-white disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </button>
      </form>
    </main>
  );
}

const TABS = ["Overview", "Leads", "Meetings", "AI knowledge", "Availability"] as const;
type Tab = (typeof TABS)[number];

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("Overview");
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/" className="flex items-center gap-2 whitespace-nowrap">
            <span className="display text-xl">Digital Solutions</span>
            <span className="annot text-mute">Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={async () => {
                await api("/api/admin/logout", { method: "POST" });
                onLogout();
              }}
              className="flex h-10 items-center gap-2 rounded-[5px] border border-line-strong px-3 text-sm text-soft hover:text-ink"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5" aria-label="Dashboard sections">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-current={tab === t ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors ${
                tab === t ? "border-signal text-ink" : "border-transparent text-mute hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        {tab === "Overview" && <OverviewTab />}
        {tab === "Leads" && <LeadsTab />}
        {tab === "Meetings" && <MeetingsTab />}
        {tab === "AI knowledge" && <KnowledgeTab />}
        {tab === "Availability" && <AvailabilityTab />}
      </main>
    </div>
  );
}

/** Small hook: load data from an admin endpoint, with loading/error state and reload. */
function useLoad<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try {
      setData(await api<T>(url));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [url]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);
  return { data, error, reload: load, setData };
}

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-[14px] border border-line bg-paper-2">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ErrorNote({ error }: { error: string }) {
  return error ? <p className="mb-4 rounded-[5px] bg-danger/10 p-3 text-sm text-danger">{error}</p> : null;
}

function OverviewTab() {
  const { data, error, reload } = useLoad<Overview>("/api/admin/overview");
  if (!data) return error ? <ErrorNote error={error} /> : <Spinner />;
  const s = data.stats;
  const cards: [string, string | number, string][] = s
    ? [
        ["Leads (30 days)", s.leads30, `${s.bySource30.chat} chat · ${s.bySource30.voice} voice · ${s.bySource30.form} form`],
        ["AI conversations (30 days)", s.conversations30, `${s.voiceConversations30} by voice`],
        ["Conversations → lead", `${s.chatConversion30}%`, "AI chats that captured a lead"],
        ["Upcoming meetings", s.upcomingMeetings, "Confirmed consultations"],
        ["Converted customers", s.converted, `of ${s.totalLeads} leads in total`],
      ]
    : [];
  const max = s ? Math.max(1, ...Object.values(s.byStatus)) : 1;

  return (
    <div className="space-y-6">
      <ErrorNote error={error} />
      {s && (
        <div className="grid gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {cards.map(([k, v, sub]) => (
            <div key={k} className="bg-paper-2 p-5">
              <p className="annot text-mute">{k}</p>
              <p className="display mt-3 text-5xl">{v}</p>
              <p className="mt-2 text-xs text-mute">{sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {s && (
          <Panel title="Pipeline" action={<IconButton label="Refresh" onClick={reload} icon={<RefreshCw className="h-4 w-4" />} />}>
            <ul className="space-y-3">
              {STATUSES.map(([k, label]) => (
                <li key={k} className="grid grid-cols-[9.5rem_1fr_2rem] items-center gap-3 text-sm">
                  <span className="text-soft">{label}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-paper-3">
                    <span className="block h-full rounded-full bg-signal" style={{ width: `${((s.byStatus[k] ?? 0) / max) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums">{s.byStatus[k] ?? 0}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
        <Panel title="Setup">
          <ul className="space-y-3 text-sm">
            {(
              [
                ["AI assistant", data.setup.ai, "Add GEMINI_API_KEY"],
                ["Database (leads, meetings)", data.setup.database, "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"],
                ["Email notifications to you", data.setup.email, "Add RESEND_API_KEY"],
                ["Confirmation emails to clients", data.setup.customerEmails, "Verify a domain in Resend, then set CONTACT_FROM_EMAIL"],
                ["Google Calendar sync (optional)", data.setup.calendar, "Add the GOOGLE_* variables"],
              ] as [string, boolean, string][]
            ).map(([label, ok, fix]) => (
              <li key={label} className="flex items-start gap-3">
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${ok ? "bg-ok text-white" : "bg-paper-3 text-mute"}`}>
                  {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </span>
                <span>
                  {label}
                  {!ok && <span className="block text-xs text-mute">{fix} (see README)</span>}
                </span>
              </li>
            ))}
          </ul>
          {data.setup.ai && <AiCheck />}
        </Panel>
      </div>
    </div>
  );
}

type AiCheckResult = {
  ok: boolean;
  model?: string;
  ms?: number;
  hint?: string;
  error?: string;
  lastProblem?: { model: string; status: number; message: string } | null;
};

/** Sends one test message to Gemini and shows exactly what Google answered. */
function AiCheck() {
  const [state, setState] = useState<"idle" | "testing">("idle");
  const [result, setResult] = useState<AiCheckResult | null>(null);

  async function run() {
    setState("testing");
    try {
      setResult(await api<AiCheckResult>("/api/admin/ai-check", { method: "POST" }));
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : "Request failed" });
    }
    setState("idle");
  }

  return (
    <div className="mt-5 border-t border-line pt-5">
      <button
        type="button"
        onClick={run}
        disabled={state === "testing"}
        className="inline-flex h-10 items-center gap-2 rounded-[5px] border border-line-strong px-4 text-sm font-medium transition-colors hover:border-signal disabled:opacity-60"
      >
        {state === "testing" ? <Spinner /> : null}
        {state === "testing" ? "Testing..." : "Test the assistant"}
      </button>
      {result && (
        <div role="status" className={`mt-4 rounded-[5px] p-3 text-sm ${result.ok ? "bg-ok/10" : "bg-danger/10 text-danger"}`}>
          {result.ok ? (
            <p>
              Working. <span className="text-mute">Answered by {result.model} in {((result.ms ?? 0) / 1000).toFixed(1)}s.</span>
            </p>
          ) : (
            <>
              <p className="font-medium">{result.hint || "The assistant is not working."}</p>
              {result.lastProblem && (
                <p className="mt-2 font-mono text-xs text-soft">
                  {result.lastProblem.model} · HTTP {result.lastProblem.status} · {result.lastProblem.message}
                </p>
              )}
              {!result.lastProblem && result.error && <p className="mt-2 font-mono text-xs text-soft">{result.error}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LeadsTab() {
  const { data, error, reload, setData } = useLoad<{ leads: Lead[] }>("/api/admin/leads");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const leads = useMemo(() => (data?.leads ?? []).filter((l) => filter === "all" || l.status === filter), [data, filter]);

  async function update(id: string, patch: Partial<Lead>) {
    setMsg("");
    try {
      await api("/api/admin/leads", { method: "PATCH", body: JSON.stringify({ id, ...patch }) });
      setData((d) => (d ? { leads: d.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) } : d));
    } catch (err) {
      setMsg((err as Error).message);
    }
  }
  async function remove(id: string) {
    if (!confirm("Delete this lead permanently? This can't be undone.")) return;
    await api(`/api/admin/leads?id=${id}`, { method: "DELETE" });
    setData((d) => (d ? { leads: d.leads.filter((l) => l.id !== id) } : d));
  }

  if (!data) return error ? <ErrorNote error={error} /> : <Spinner />;
  return (
    <div>
      <ErrorNote error={error || msg} />
      <div className="-mx-5 mb-5 flex items-center gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[["all", "All"], ...STATUSES].map(([k, label]) => {
          const count = k === "all" ? data.leads.length : data.leads.filter((l) => l.status === k).length;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`shrink-0 whitespace-nowrap rounded-[5px] border px-3 py-1.5 text-[13px] ${filter === k ? "border-signal bg-signal text-white" : "border-line-strong text-soft hover:text-ink"}`}
            >
              {label} <span className="opacity-70">{count}</span>
            </button>
          );
        })}
        <IconButton label="Refresh" onClick={reload} icon={<RefreshCw className="h-4 w-4" />} className="ml-auto shrink-0" />
      </div>

      {!leads.length ? (
        <Empty>No leads here yet. They&apos;ll appear as soon as the AI assistant or contact form captures one.</Empty>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-paper-2">
          {leads.map((l) => {
            const isOpen = open === l.id;
            return (
              <li key={l.id}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 sm:px-5">
                  <button type="button" onClick={() => setOpen(isOpen ? null : l.id)} className="flex min-w-0 basis-full items-center gap-3 text-left sm:basis-auto sm:flex-1" aria-expanded={isOpen}>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-mute transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {l.name || "Unnamed visitor"}
                        {l.business_name && <span className="text-mute"> · {l.business_name}</span>}
                      </span>
                      <span className="block truncate text-xs text-mute">
                        {fmt(l.created_at)} · {l.source === "form" ? "Contact form" : l.source === "voice" ? "Voice AI" : "Chat AI"}
                        {l.service && ` · ${l.service}`}
                      </span>
                    </span>
                  </button>
                  <span className={`hidden rounded-[4px] px-2 py-1 text-[11px] font-medium sm:inline ${STATUS_TONE[l.status] ?? ""}`}>{statusLabel(l.status)}</span>
                  <select
                    aria-label="Change status"
                    value={l.status}
                    onChange={(e) => update(l.id, { status: e.target.value })}
                    className="ml-7 rounded-[5px] border border-line-strong bg-paper px-2 py-1.5 text-[13px] sm:ml-0"
                  >
                    {STATUSES.map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                {isOpen && <LeadDetail lead={l} onNotes={(notes) => update(l.id, { notes })} onDelete={() => remove(l.id)} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function LeadDetail({ lead: l, onNotes, onDelete }: { lead: Lead; onNotes: (n: string) => void; onDelete: () => void }) {
  const [notes, setNotes] = useState(l.notes ?? "");
  const fields: [string, string | null | undefined, string?][] = [
    ["Email", l.email, l.email ? `mailto:${l.email}` : undefined],
    ["Phone", l.phone, l.phone ? `tel:${l.phone.replace(/\s/g, "")}` : undefined],
    ["Industry", l.industry],
    ["Service", l.service],
    ["Budget", l.budget],
  ];
  return (
    <div className="grid gap-6 border-t border-line bg-paper px-5 py-5 sm:px-12 lg:grid-cols-2">
      <dl className="space-y-2 text-sm">
        {fields.map(([k, v, href]) => (
          <div key={k} className="grid grid-cols-[6rem_1fr] gap-2">
            <dt className="text-mute">{k}</dt>
            <dd className="min-w-0 break-words">{v ? href ? <a className="text-signal underline-offset-2 hover:underline" href={href}>{v}</a> : v : <span className="text-mute">-</span>}</dd>
          </div>
        ))}
        {l.requirements && (
          <div className="pt-3">
            <dt className="annot text-mute">Requirements</dt>
            <dd className="mt-1 whitespace-pre-wrap text-soft">{l.requirements}</dd>
          </div>
        )}
        {l.summary && (
          <div className="pt-3">
            <dt className="annot text-mute">AI conversation summary</dt>
            <dd className="mt-1 whitespace-pre-wrap text-soft">{l.summary}</dd>
          </div>
        )}
      </dl>
      <div>
        <label className="annot text-mute" htmlFor={`n-${l.id}`}>
          Your notes
        </label>
        <textarea
          id={`n-${l.id}`}
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2 w-full rounded-[5px] border border-line-strong bg-paper-2 p-3 text-sm"
          placeholder="Follow-up plans, quotes sent..."
        />
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={onDelete} className="flex items-center gap-1.5 text-sm text-danger hover:underline">
            <Trash2 className="h-4 w-4" /> Delete lead
          </button>
          <button type="button" onClick={() => onNotes(notes)} disabled={notes === (l.notes ?? "")} className="rounded-[5px] bg-signal px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
            Save notes
          </button>
        </div>
      </div>
    </div>
  );
}

function MeetingsTab() {
  const { data, error, reload, setData } = useLoad<{ bookings: Booking[] }>("/api/admin/bookings");
  const [msg, setMsg] = useState("");
  if (!data) return error ? <ErrorNote error={error} /> : <Spinner />;
  const now = new Date().toISOString();
  const upcoming = data.bookings.filter((b) => b.starts_at >= now);
  const past = data.bookings.filter((b) => b.starts_at < now).reverse();

  async function setStatus(id: string, status: Booking["status"]) {
    if (status === "cancelled" && !confirm("Cancel this meeting? The time becomes available again. Remember to let the client know.")) return;
    setMsg("");
    try {
      await api("/api/admin/bookings", { method: "PATCH", body: JSON.stringify({ id, status }) });
      setData((d) => (d ? { bookings: d.bookings.map((b) => (b.id === id ? { ...b, status } : b)) } : d));
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  const list = (items: Booking[]) => (
    <ul className="divide-y divide-line">
      {items.map((b) => (
        <li key={b.id} className={`flex flex-wrap items-center gap-x-5 gap-y-2 py-4 ${b.status === "cancelled" ? "opacity-50" : ""}`}>
          <div className="w-44 shrink-0">
            <p className="font-medium">{fmt(b.starts_at)}</p>
            <p className="text-xs text-mute">{b.mode === "online" ? "Online" : "In person"}</p>
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium">
              {b.name}
              {b.service && <span className="font-normal text-mute"> · {b.service}</span>}
            </p>
            <p className="truncate text-mute">
              <a className="hover:text-signal" href={`mailto:${b.email}`}>{b.email}</a>
              {b.phone && <> · <a className="hover:text-signal" href={`tel:${b.phone.replace(/\s/g, "")}`}>{b.phone}</a></>}
            </p>
            {b.notes && <p className="mt-1 text-soft">{b.notes}</p>}
          </div>
          <select
            aria-label="Meeting status"
            value={b.status}
            onChange={(e) => setStatus(b.id, e.target.value as Booking["status"])}
            className="rounded-[5px] border border-line-strong bg-paper px-2 py-1.5 text-[13px]"
          >
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-6">
      <ErrorNote error={error || msg} />
      <Panel title={`Upcoming (${upcoming.length})`} action={<IconButton label="Refresh" onClick={reload} icon={<RefreshCw className="h-4 w-4" />} />}>
        {upcoming.length ? list(upcoming) : <Empty>No upcoming meetings yet. The AI assistant books them straight into your free times.</Empty>}
      </Panel>
      {past.length > 0 && <Panel title="Past 60 days">{list(past)}</Panel>}
    </div>
  );
}

function useSettings() {
  return useLoad<{ knowledge: Knowledge; availability: Availability; editable: boolean }>("/api/admin/settings");
}

function KnowledgeTab() {
  const { data, error } = useSettings();
  const [k, setK] = useState<Knowledge | null>(null);
  const [state, setState] = useState<"" | "saving" | "saved">("");
  const [msg, setMsg] = useState("");
  const value = k ?? data?.knowledge ?? null;
  if (!value || !data) return error ? <ErrorNote error={error} /> : <Spinner />;

  const field = (key: keyof Knowledge, label: string, help: string, placeholder: string) => (
    <div>
      <label htmlFor={`k-${key}`} className="font-medium">
        {label}
      </label>
      <p className="mt-1 text-sm text-mute">{help}</p>
      <textarea
        id={`k-${key}`}
        rows={7}
        value={value[key]}
        onChange={(e) => {
          setK({ ...value, [key]: e.target.value });
          setState("");
        }}
        placeholder={placeholder}
        className="mt-3 w-full rounded-[5px] border border-line-strong bg-paper p-3 text-sm leading-relaxed"
      />
    </div>
  );

  return (
    <Panel title="What the AI assistant knows">
      <ErrorNote error={msg} />
      {!data.editable && <p className="mb-5 rounded-[5px] bg-danger/10 p-3 text-sm text-danger">Connect the database to edit this (see README).</p>}
      <div className="space-y-8">
        {field(
          "pricing",
          "Approved pricing",
          "Extra pricing details the AI may quote, exactly as you write them. The AI already knows your R2,500 to R30,000 range (set in src/lib/site.ts) and always offers a free consultation for an exact quote.",
          "e.g.\nBusiness website (up to 5 pages): from R4,500\nOnline store: from R9,000\nMonthly hosting & support: R350/month",
        )}
        {field(
          "business",
          "More about the business",
          "Anything else the AI may tell visitors: turnaround times, what's included, hosting, support, payment terms.",
          "e.g. Most business websites take 2 to 3 weeks. Every site includes basic SEO and mobile optimisation. 50% deposit to start.",
        )}
        {field(
          "faqs",
          "FAQs",
          "Common questions with the answers you approve.",
          "Q: Do you do logos?\nA: We can recommend a designer and build your site around your brand.",
        )}
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        {state === "saved" && <span className="text-sm text-ok">Saved. The AI uses this within a minute.</span>}
        <button
          type="button"
          disabled={!data.editable || state === "saving" || !k}
          onClick={async () => {
            setState("saving");
            setMsg("");
            try {
              await api("/api/admin/settings", { method: "PUT", body: JSON.stringify({ knowledge: value }) });
              setState("saved");
            } catch (err) {
              setMsg((err as Error).message);
              setState("");
            }
          }}
          className="flex items-center gap-2 rounded-[5px] bg-signal px-5 py-2.5 font-medium text-white disabled:opacity-40"
        >
          {state === "saving" && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
      </div>
    </Panel>
  );
}

function AvailabilityTab() {
  const { data, error } = useSettings();
  const [a, setA] = useState<Availability | null>(null);
  const [state, setState] = useState<"" | "saving" | "saved">("");
  const [msg, setMsg] = useState("");
  const value = a ?? data?.availability ?? null;
  if (!value || !data) return error ? <ErrorNote error={error} /> : <Spinner />;
  const set = (patch: Partial<Availability>) => {
    setA({ ...value, ...patch });
    setState("");
  };
  const input = "mt-2 w-full rounded-[5px] border border-line-strong bg-paper px-3 py-2.5";

  return (
    <Panel title="When clients can book a consultation">
      <ErrorNote error={msg} />
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="font-medium">Days</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DAYS.map((d, i) => {
              const on = value.days.includes(i);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ days: on ? value.days.filter((x) => x !== i) : [...value.days, i].sort() })}
                  className={`h-10 w-14 rounded-[5px] border text-sm ${on ? "border-signal bg-signal text-white" : "border-line-strong text-soft"}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm text-soft">
            From
            <input type="time" value={value.start} onChange={(e) => set({ start: e.target.value })} className={input} />
          </label>
          <label className="text-sm text-soft">
            Until
            <input type="time" value={value.end} onChange={(e) => set({ end: e.target.value })} className={input} />
          </label>
        </div>
        <label className="text-sm text-soft">
          Meeting length
          <select value={value.meetingMinutes} onChange={(e) => set({ meetingMinutes: Number(e.target.value) })} className={input}>
            {[15, 30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm text-soft">
            Minimum notice (hours)
            <input type="number" min={0} max={168} value={value.minNoticeHours} onChange={(e) => set({ minNoticeHours: Number(e.target.value) })} className={input} />
          </label>
          <label className="text-sm text-soft">
            Book up to (days ahead)
            <input type="number" min={1} max={180} value={value.maxDaysAhead} onChange={(e) => set({ maxDaysAhead: Number(e.target.value) })} className={input} />
          </label>
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={value.inPerson} onChange={(e) => set({ inPerson: e.target.checked })} className="h-4 w-4 accent-[var(--color-signal)]" />
            <span>Offer in-person meetings</span>
          </label>
          {value.inPerson && (
            <label className="mt-4 block max-w-md text-sm text-soft">
              Where (in your words)
              <input value={value.inPersonArea} onChange={(e) => set({ inPersonArea: e.target.value })} className={input} />
            </label>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        {state === "saved" && <span className="text-sm text-ok">Saved.</span>}
        <button
          type="button"
          disabled={!data.editable || state === "saving" || !a}
          onClick={async () => {
            setState("saving");
            setMsg("");
            try {
              await api("/api/admin/settings", { method: "PUT", body: JSON.stringify({ availability: value }) });
              setState("saved");
            } catch (err) {
              setMsg((err as Error).message);
              setState("");
            }
          }}
          className="flex items-center gap-2 rounded-[5px] bg-signal px-5 py-2.5 font-medium text-white disabled:opacity-40"
        >
          {state === "saving" && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
      </div>
    </Panel>
  );
}

function IconButton({ label, onClick, icon, className = "" }: { label: string; onClick: () => void; icon: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`grid h-9 w-9 place-items-center rounded-[5px] border border-line-strong text-soft hover:text-ink ${className}`}>
      {icon}
    </button>
  );
}
function Spinner() {
  return (
    <div className="grid place-items-center py-24">
      <Loader2 className="h-6 w-6 animate-spin text-mute" />
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[14px] border border-dashed border-line-strong p-10 text-center text-sm text-mute">{children}</p>;
}
