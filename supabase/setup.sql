-- ============================================================================
-- Digital Solutions WC: database setup for the AI assistant, leads, bookings
-- and admin dashboard.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste this whole
-- file > Run. Safe to run again (it only creates what's missing).
--
-- SECURITY: Row Level Security is ON for every table with NO public policies.
-- That means nobody can read or write these tables from a browser. Only the
-- website's server (using the secret service role key) can, so leads and
-- bookings are never exposed to visitors.
-- ============================================================================

-- Leads: one row per potential client (from the AI chat, voice or the contact form).
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null default 'chat' check (source in ('chat', 'voice', 'form')),
  status text not null default 'new' check (status in (
    'new', 'interested', 'qualified', 'meeting_requested', 'meeting_confirmed', 'converted', 'not_interested'
  )),
  name text,
  email text,
  phone text,
  business_name text,
  industry text,
  service text,
  budget text,
  requirements text,
  -- A short AI-written summary of the conversation. Full transcripts are NOT stored.
  summary text,
  notes text,
  conversation_id text
);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_conversation_idx on public.leads (conversation_id);

-- Conversations: counts only (no message content), for the admin statistics.
create table if not exists public.conversations (
  id text primary key,
  started_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  messages int not null default 0,
  channel text not null default 'text' check (channel in ('text', 'voice')),
  lead_id uuid references public.leads (id) on delete set null
);
create index if not exists conversations_started_idx on public.conversations (started_at desc);

-- Bookings: consultation meetings.
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  service text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  mode text not null default 'online' check (mode in ('online', 'in_person')),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  notes text,
  google_event_id text
);
-- The double-booking guard: two active bookings can never share a start time,
-- even if two people press "book" at the exact same moment.
create unique index if not exists bookings_no_double_booking
  on public.bookings (starts_at) where status = 'confirmed';
create index if not exists bookings_starts_idx on public.bookings (starts_at);

-- Settings the AI uses (pricing, business info, FAQs, availability). Edited from /admin.
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Counts a chat message against its conversation (creates the row the first time).
create or replace function public.track_conversation(p_id text, p_channel text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.conversations (id, channel, messages)
  values (p_id, case when p_channel = 'voice' then 'voice' else 'text' end, 1)
  on conflict (id) do update
    set messages = public.conversations.messages + 1,
        last_at = now(),
        channel = case when p_channel = 'voice' then 'voice' else public.conversations.channel end;
$$;
revoke all on function public.track_conversation(text, text) from public, anon, authenticated;
grant execute on function public.track_conversation(text, text) to service_role;

-- Keep updated_at fresh on leads.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
drop trigger if exists leads_touch on public.leads;
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

-- Lock everything down: RLS on, no policies = no browser access at all.
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.bookings enable row level security;
alter table public.settings enable row level security;
