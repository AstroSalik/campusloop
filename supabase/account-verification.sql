-- Run before enabling account verification. The browser has no access to these tables.
create table if not exists public.account_verifications (
  user_id uuid not null references auth.users (id) on delete cascade,
  method text not null check (method in ('aadhaar', 'aadhaar_sandbox', 'campus_email')),
  attempt_id uuid not null,
  status text not null check (status in ('starting', 'pending', 'verified', 'failed')),
  created_at timestamptz not null,
  expires_at timestamptz not null,
  verified_at timestamptz,
  last_checked_at timestamptz,
  provider_request_id uuid unique,
  consent_version text,
  campus_domain text,
  code_digest text,
  failed_attempts integer not null default 0 check (failed_attempts between 0 and 5),
  primary key (user_id, method)
);

alter table public.account_verifications enable row level security;
revoke all on public.account_verifications from public, anon, authenticated;
grant select, insert, update, delete on public.account_verifications to service_role;

create table if not exists public.campus_verification_email_limits (
  recipient_digest text primary key,
  last_sent_at timestamptz not null,
  window_started_at timestamptz not null,
  sends integer not null check (sends between 1 and 5)
);

alter table public.campus_verification_email_limits enable row level security;
revoke all on public.campus_verification_email_limits from public, anon, authenticated;
grant select, insert, update, delete on public.campus_verification_email_limits to service_role;

create or replace function public.reserve_campus_verification_email(p_recipient_digest text)
returns boolean
language sql
set search_path = ''
as $$
  with reserved as (
    insert into public.campus_verification_email_limits as limits
      (recipient_digest, last_sent_at, window_started_at, sends)
    values (p_recipient_digest, now(), now(), 1)
    on conflict (recipient_digest) do update
      set last_sent_at = now(),
          window_started_at = case when limits.window_started_at <= now() - interval '1 day'
            then now() else limits.window_started_at end,
          sends = case when limits.window_started_at <= now() - interval '1 day'
            then 1 else limits.sends + 1 end
    where limits.last_sent_at <= now() - interval '1 minute'
      and (limits.window_started_at <= now() - interval '1 day' or limits.sends < 5)
    returning 1
  )
  select exists (select 1 from reserved);
$$;

revoke execute on function public.reserve_campus_verification_email(text) from public, anon, authenticated;
grant execute on function public.reserve_campus_verification_email(text) to service_role;
