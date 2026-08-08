create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254),
  subject text not null check (char_length(subject) between 2 and 180),
  message text not null check (char_length(message) between 10 and 5000),
  language text not null default 'tr' check (language in ('tr', 'en', 'de')),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  email_notified boolean not null default false
);

alter table public.contact_messages enable row level security;

revoke all on table public.contact_messages from anon, authenticated;

grant all on table public.contact_messages to service_role;

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

create index if not exists contact_messages_status_idx
  on public.contact_messages (status, created_at desc);
