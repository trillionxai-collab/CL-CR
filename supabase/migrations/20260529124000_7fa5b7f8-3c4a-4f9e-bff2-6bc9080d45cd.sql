-- Create followup_history audit table
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
