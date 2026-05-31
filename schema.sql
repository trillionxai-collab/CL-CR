-- ============================================================
-- The Human Reconnection Journey — Database schema
-- Run this ONCE in your own Supabase project:
--   Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run; uses IF NOT EXISTS / CREATE OR REPLACE.
-- ============================================================

-- Required extensions
create extension if not exists pgcrypto;

-- ---------- helper: updated_at trigger function ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- journey_users
-- ============================================================
create table if not exists public.journey_users (
  id                    uuid primary key default gen_random_uuid(),
  first_name            text not null,
  last_name             text not null,
  phone_number          text not null unique,
  date_of_birth         date,
  gender                text,
  lifestyle             text,
  open_mind_consent     boolean not null default false,
  onboarding_completed  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  last_login_at         timestamptz
);

create index if not exists journey_users_phone_idx
  on public.journey_users(phone_number);

drop trigger if exists set_updated_at on public.journey_users;
create trigger set_updated_at
  before update on public.journey_users
  for each row execute function public.set_updated_at();

alter table public.journey_users enable row level security;

-- Deny all direct anon/authenticated access. The app always reads/writes
-- this table via the server using the service role key, which BYPASSES
-- RLS. This keeps user PII strictly server-mediated.
drop policy if exists "journey_users no direct access" on public.journey_users;
create policy "journey_users no direct access"
  on public.journey_users
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ============================================================
-- otp_verifications  (ephemeral — server-only)
-- ============================================================
create table if not exists public.otp_verifications (
  id           uuid primary key default gen_random_uuid(),
  phone_number text not null,
  otp_hash     text not null,
  expires_at   timestamptz not null,
  attempts     int not null default 0,
  verified     boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists otp_verifications_phone_idx
  on public.otp_verifications(phone_number);
create index if not exists otp_verifications_expires_idx
  on public.otp_verifications(expires_at);

alter table public.otp_verifications enable row level security;

drop policy if exists "otp_verifications no direct access" on public.otp_verifications;
create policy "otp_verifications no direct access"
  on public.otp_verifications
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ============================================================
-- user_sessions  (custom long-lived sessions)
-- ============================================================
create table if not exists public.user_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.journey_users(id) on delete cascade,
  session_token_hash text not null unique,
  device_info        text,
  ip_address         text,
  expires_at         timestamptz not null,
  created_at         timestamptz not null default now(),
  last_active_at     timestamptz not null default now()
);

create index if not exists user_sessions_user_idx
  on public.user_sessions(user_id);
create index if not exists user_sessions_expires_idx
  on public.user_sessions(expires_at);

alter table public.user_sessions enable row level security;

drop policy if exists "user_sessions no direct access" on public.user_sessions;
create policy "user_sessions no direct access"
  on public.user_sessions
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ============================================================
-- journey_progress
-- ============================================================
create table if not exists public.journey_progress (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null unique references public.journey_users(id) on delete cascade,
  current_level         int not null default 0,
  completion_percentage numeric(5,2) not null default 0,
  total_watch_time      int not null default 0, -- seconds
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.journey_progress;
create trigger set_updated_at
  before update on public.journey_progress
  for each row execute function public.set_updated_at();

alter table public.journey_progress enable row level security;

drop policy if exists "journey_progress no direct access" on public.journey_progress;
create policy "journey_progress no direct access"
  on public.journey_progress
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ============================================================
-- followup_history
-- ============================================================
create table if not exists public.followup_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.journey_users(id) on delete cascade,
  type text not null,
  template_used text,
  sent_at timestamptz not null default now(),
  status text not null,
  user_stage text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists followup_history_user_idx
  on public.followup_history(user_id);
create index if not exists followup_history_sent_at_idx
  on public.followup_history(sent_at);

alter table public.followup_history enable row level security;

drop policy if exists "followup_history no direct access" on public.followup_history;
create policy "followup_history no direct access"
  on public.followup_history
  for all
  to anon, authenticated
  using (false)
  with check (false);

drop trigger if exists set_updated_at on public.followup_history;
create trigger set_updated_at
  before update on public.followup_history
  for each row execute function public.set_updated_at();

-- ============================================================
-- (Optional) scheduled cleanup of expired OTPs & sessions
-- Enable pg_cron in Database → Extensions, then uncomment:
-- ============================================================
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'cleanup-expired-otps-and-sessions',
--   '*/15 * * * *',
--   $$
--     delete from public.otp_verifications where expires_at < now() - interval '1 hour';
--     delete from public.user_sessions where expires_at < now();
--   $$
-- );
