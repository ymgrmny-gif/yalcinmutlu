alter table yalcinmutlu.documents
  add column if not exists application_role text null;

alter table yalcinmutlu.documents
  drop constraint if exists documents_application_role_check;

alter table yalcinmutlu.documents
  add constraint documents_application_role_check
  check (application_role is null or application_role in ('cover_letter'));

update yalcinmutlu.documents
set application_role = 'cover_letter'
where application_role is null
  and category = 'other'
  and lower(trim(title_de)) = 'anschreiben'
  and lower(trim(title_en)) = 'cover letter'
  and lower(trim(title_tr)) = lower('Ön Yazı');

create or replace function public.yalcinmutlu_document_list(p_token text, p_language text default 'tr')
returns table(document_id uuid, category text, title text, description text, can_download boolean)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_user_id uuid;
  v_session_id uuid;
  v_language text := case when p_language in ('tr','en','de') then p_language else 'tr' end;
begin
  if p_token is null or char_length(p_token) <> 64 then
    return;
  end if;

  select u.id, s.id into v_user_id, v_session_id
  from yalcinmutlu.access_sessions s
  join yalcinmutlu.access_users u on u.id = s.access_user_id
  where s.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    and s.revoked_at is null
    and s.expires_at > now()
    and u.is_active = true
    and (u.expires_at is null or u.expires_at > now())
  limit 1;

  if not found then
    return;
  end if;

  insert into yalcinmutlu.access_logs(access_user_id, access_session_id, action, language)
  values (v_user_id, v_session_id, 'list', v_language);

  return query
  select
    d.id,
    case when d.application_role = 'cover_letter' then 'cover_letter' else d.category end,
    case v_language when 'de' then d.title_de when 'en' then d.title_en else d.title_tr end,
    case v_language when 'de' then d.description_de when 'en' then d.description_en else d.description_tr end,
    p.can_download
  from yalcinmutlu.document_permissions p
  join yalcinmutlu.documents d on d.id = p.document_id
  where p.access_user_id = v_user_id
    and p.can_view = true
    and d.is_active = true
  order by
    case when d.category = 'cv' then 1 when d.application_role = 'cover_letter' then 2 when d.category = 'diploma' then 3 when d.category = 'certificate' then 4 when d.category = 'reference' then 5 else 6 end,
    d.created_at desc;
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
  select d.id,
    case when d.application_role = 'cover_letter' then 'cover_letter' else d.category end,
    case v_language when 'de' then d.title_de when 'en' then d.title_en else d.title_tr end,
    case v_language when 'de' then d.description_de when 'en' then d.description_en else d.description_tr end,
    gd.can_download
  from yalcinmutlu.guest_access_documents gd
  join yalcinmutlu.documents d on d.id = gd.document_id
  where gd.guest_access_link_id = v_link_id and d.is_active = true
  order by
    case when d.category = 'cv' then 1 when d.application_role = 'cover_letter' then 2 when d.category = 'diploma' then 3 when d.category = 'certificate' then 4 when d.category = 'reference' then 5 else 6 end,
    d.created_at desc;
end;
$$;
