create table if not exists yalcinmutlu.guest_access_links (
  id uuid primary key default extensions.gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 160),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  note text null check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  expires_at timestamptz null,
  revoked_at timestamptz null,
  last_access_at timestamptz null,
  access_count bigint not null default 0 check (access_count >= 0)
);

create table if not exists yalcinmutlu.guest_access_documents (
  guest_access_link_id uuid not null references yalcinmutlu.guest_access_links(id) on delete cascade,
  document_id uuid not null references yalcinmutlu.documents(id) on delete cascade,
  can_download boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (guest_access_link_id, document_id)
);

create table if not exists yalcinmutlu.guest_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  guest_access_link_id uuid not null references yalcinmutlu.guest_access_links(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz null
);

create index if not exists guest_access_links_active_idx on yalcinmutlu.guest_access_links (revoked_at, expires_at);
create index if not exists guest_access_documents_document_idx on yalcinmutlu.guest_access_documents (document_id);
create index if not exists guest_sessions_link_idx on yalcinmutlu.guest_sessions (guest_access_link_id, revoked_at, expires_at);

alter table yalcinmutlu.guest_access_links enable row level security;
alter table yalcinmutlu.guest_access_documents enable row level security;
alter table yalcinmutlu.guest_sessions enable row level security;

revoke all on table yalcinmutlu.guest_access_links from anon, authenticated;
revoke all on table yalcinmutlu.guest_access_documents from anon, authenticated;
revoke all on table yalcinmutlu.guest_sessions from anon, authenticated;
grant select, insert, update, delete on table yalcinmutlu.guest_access_links to service_role;
grant select, insert, update, delete on table yalcinmutlu.guest_access_documents to service_role;
grant select, insert, update, delete on table yalcinmutlu.guest_sessions to service_role;

create or replace function public.yalcinmutlu_admin_create_guest_link(
  p_token text,
  p_label text,
  p_note text,
  p_expires_at timestamptz,
  p_token_hash text,
  p_document_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_admin uuid;
  v_id uuid;
  v_document_count integer;
begin
  v_admin := yalcinmutlu.require_admin(p_token);
  if p_label is null or char_length(trim(p_label)) < 1 or char_length(trim(p_label)) > 160 then
    raise exception 'INVALID_LABEL';
  end if;
  if p_note is not null and char_length(p_note) > 1000 then
    raise exception 'INVALID_NOTE';
  end if;
  if p_expires_at is not null and p_expires_at <= now() then
    raise exception 'INVALID_EXPIRY';
  end if;
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_TOKEN_HASH';
  end if;
  if coalesce(array_length(p_document_ids, 1), 0) < 1 then
    raise exception 'DOCUMENT_REQUIRED';
  end if;

  select count(*) into v_document_count
  from yalcinmutlu.documents d
  where d.id = any(p_document_ids) and d.is_active = true;
  if v_document_count <> (select count(distinct x) from unnest(p_document_ids) as x) then
    raise exception 'INVALID_DOCUMENT';
  end if;

  insert into yalcinmutlu.guest_access_links(label, token_hash, note, expires_at)
  values (trim(p_label), p_token_hash, nullif(trim(coalesce(p_note, '')), ''), p_expires_at)
  returning id into v_id;

  insert into yalcinmutlu.guest_access_documents(guest_access_link_id, document_id, can_download)
  select v_id, x, true from (select distinct unnest(p_document_ids) as x) s;

  return v_id;
end;
$$;

create or replace function public.yalcinmutlu_admin_guest_links(p_token text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_admin uuid;
  v_result jsonb;
begin
  v_admin := yalcinmutlu.require_admin(p_token);
  select jsonb_build_object(
    'links', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', l.id,
          'label', l.label,
          'note', l.note,
          'createdAt', l.created_at,
          'expiresAt', l.expires_at,
          'revokedAt', l.revoked_at,
          'lastAccessAt', l.last_access_at,
          'accessCount', l.access_count,
          'documentIds', coalesce((select jsonb_agg(gd.document_id order by gd.created_at) from yalcinmutlu.guest_access_documents gd where gd.guest_access_link_id = l.id), '[]'::jsonb)
        ) order by l.created_at desc
      ) from yalcinmutlu.guest_access_links l
    ), '[]'::jsonb),
    'documents', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', d.id,
        'category', d.category,
        'titleTr', d.title_tr,
        'titleDe', d.title_de,
        'titleEn', d.title_en,
        'isActive', d.is_active
      ) order by d.created_at desc)
      from yalcinmutlu.documents d
    ), '[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.yalcinmutlu_admin_revoke_guest_link(p_token text, p_guest_link_id uuid)
returns boolean
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_admin uuid;
begin
  v_admin := yalcinmutlu.require_admin(p_token);
  update yalcinmutlu.guest_access_links
    set revoked_at = coalesce(revoked_at, now())
    where id = p_guest_link_id;
  if not found then return false; end if;
  update yalcinmutlu.guest_sessions
    set revoked_at = coalesce(revoked_at, now())
    where guest_access_link_id = p_guest_link_id and revoked_at is null;
  return true;
end;
$$;

create or replace function public.yalcinmutlu_guest_exchange(p_token_hash text)
returns table(session_token text, session_expires_at timestamptz, label text)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_link yalcinmutlu.guest_access_links%rowtype;
  v_token text;
  v_expires timestamptz;
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then return; end if;
  select * into v_link
  from yalcinmutlu.guest_access_links l
  where l.token_hash = p_token_hash
    and l.revoked_at is null
    and (l.expires_at is null or l.expires_at > now())
  limit 1;
  if not found then return; end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_expires := least(coalesce(v_link.expires_at, now() + interval '2 hours'), now() + interval '2 hours');
  insert into yalcinmutlu.guest_sessions(guest_access_link_id, token_hash, expires_at)
  values (v_link.id, encode(extensions.digest(v_token, 'sha256'), 'hex'), v_expires);

  update yalcinmutlu.guest_access_links
    set last_access_at = now(), access_count = access_count + 1
    where id = v_link.id;

  return query select v_token, v_expires, v_link.label;
end;
$$;

create or replace function public.yalcinmutlu_guest_session(p_token text)
returns table(valid boolean, label text, session_expires_at timestamptz)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_session_id uuid;
  v_label text;
  v_expires timestamptz;
begin
  if p_token is null or char_length(p_token) <> 64 then
    return query select false, null::text, null::timestamptz; return;
  end if;
  select s.id, l.label, s.expires_at into v_session_id, v_label, v_expires
  from yalcinmutlu.guest_sessions s
  join yalcinmutlu.guest_access_links l on l.id = s.guest_access_link_id
  where s.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    and s.revoked_at is null
    and s.expires_at > now()
    and l.revoked_at is null
    and (l.expires_at is null or l.expires_at > now())
  limit 1;
  if not found then
    return query select false, null::text, null::timestamptz; return;
  end if;
  update yalcinmutlu.guest_sessions set last_seen_at = now() where id = v_session_id;
  return query select true, v_label, v_expires;
end;
$$;

create or replace function public.yalcinmutlu_guest_document_list(p_token text, p_language text default 'de')
returns table(document_id uuid, category text, title text, description text, can_download boolean)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_link_id uuid;
  v_session_id uuid;
  v_language text := case when p_language in ('tr','en','de') then p_language else 'de' end;
begin
  if p_token is null or char_length(p_token) <> 64 then return; end if;
  select l.id, s.id into v_link_id, v_session_id
  from yalcinmutlu.guest_sessions s
  join yalcinmutlu.guest_access_links l on l.id = s.guest_access_link_id
  where s.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    and s.revoked_at is null and s.expires_at > now()
    and l.revoked_at is null and (l.expires_at is null or l.expires_at > now())
  limit 1;
  if not found then return; end if;
  update yalcinmutlu.guest_sessions set last_seen_at = now() where id = v_session_id;
  return query
  select d.id, d.category,
    case v_language when 'de' then d.title_de when 'en' then d.title_en else d.title_tr end,
    case v_language when 'de' then d.description_de when 'en' then d.description_en else d.description_tr end,
    gd.can_download
  from yalcinmutlu.guest_access_documents gd
  join yalcinmutlu.documents d on d.id = gd.document_id
  where gd.guest_access_link_id = v_link_id and d.is_active = true
  order by case d.category when 'cv' then 1 when 'diploma' then 2 when 'certificate' then 3 when 'reference' then 4 else 5 end, d.created_at desc;
end;
$$;

create or replace function public.yalcinmutlu_guest_document_access(p_token text, p_document_id uuid, p_action text default 'view')
returns table(document_id uuid, storage_bucket text, storage_path text, mime_type text, can_download boolean)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_link_id uuid;
  v_session_id uuid;
  v_can_download boolean;
  v_action text := case when p_action = 'download' then 'download' else 'view' end;
begin
  if p_token is null or char_length(p_token) <> 64 or p_document_id is null then return; end if;
  select l.id, s.id into v_link_id, v_session_id
  from yalcinmutlu.guest_sessions s
  join yalcinmutlu.guest_access_links l on l.id = s.guest_access_link_id
  where s.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    and s.revoked_at is null and s.expires_at > now()
    and l.revoked_at is null and (l.expires_at is null or l.expires_at > now())
  limit 1;
  if not found then return; end if;

  select gd.can_download into v_can_download
  from yalcinmutlu.guest_access_documents gd
  join yalcinmutlu.documents d on d.id = gd.document_id
  where gd.guest_access_link_id = v_link_id and gd.document_id = p_document_id and d.is_active = true
  limit 1;
  if not found then return; end if;
  if v_action = 'download' and v_can_download is not true then return; end if;

  update yalcinmutlu.guest_sessions set last_seen_at = now() where id = v_session_id;
  return query
    select d.id, d.storage_bucket, d.storage_path, d.mime_type, v_can_download
    from yalcinmutlu.documents d
    where d.id = p_document_id and d.is_active = true;
end;
$$;

create or replace function public.yalcinmutlu_guest_logout(p_token text)
returns boolean
language plpgsql
security definer
set search_path to ''
as $$
begin
  if p_token is null or char_length(p_token) <> 64 then return true; end if;
  update yalcinmutlu.guest_sessions
    set revoked_at = coalesce(revoked_at, now())
    where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
  return true;
end;
$$;

revoke all on function public.yalcinmutlu_admin_create_guest_link(text,text,text,timestamptz,text,uuid[]) from public, anon, authenticated;
revoke all on function public.yalcinmutlu_admin_guest_links(text) from public, anon, authenticated;
revoke all on function public.yalcinmutlu_admin_revoke_guest_link(text,uuid) from public, anon, authenticated;
revoke all on function public.yalcinmutlu_guest_exchange(text) from public, anon, authenticated;
revoke all on function public.yalcinmutlu_guest_session(text) from public, anon, authenticated;
revoke all on function public.yalcinmutlu_guest_document_list(text,text) from public, anon, authenticated;
revoke all on function public.yalcinmutlu_guest_document_access(text,uuid,text) from public, anon, authenticated;
revoke all on function public.yalcinmutlu_guest_logout(text) from public, anon, authenticated;

grant execute on function public.yalcinmutlu_admin_create_guest_link(text,text,text,timestamptz,text,uuid[]) to service_role;
grant execute on function public.yalcinmutlu_admin_guest_links(text) to service_role;
grant execute on function public.yalcinmutlu_admin_revoke_guest_link(text,uuid) to service_role;
grant execute on function public.yalcinmutlu_guest_exchange(text) to service_role;
grant execute on function public.yalcinmutlu_guest_session(text) to service_role;
grant execute on function public.yalcinmutlu_guest_document_list(text,text) to service_role;
grant execute on function public.yalcinmutlu_guest_document_access(text,uuid,text) to service_role;
grant execute on function public.yalcinmutlu_guest_logout(text) to service_role;
