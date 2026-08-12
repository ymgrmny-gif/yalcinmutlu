create or replace function public.yalcinmutlu_admin_update_guest_link(
  p_token text,
  p_guest_link_id uuid,
  p_label text,
  p_note text,
  p_expires_at timestamptz,
  p_document_ids uuid[]
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_admin uuid;
  v_document_count integer;
  v_requested_count integer;
begin
  v_admin := yalcinmutlu.require_admin(p_token);

  if p_guest_link_id is null then
    raise exception 'INVALID_GUEST_LINK';
  end if;
  if p_label is null or char_length(trim(p_label)) < 1 or char_length(trim(p_label)) > 160 then
    raise exception 'INVALID_LABEL';
  end if;
  if p_note is not null and char_length(p_note) > 1000 then
    raise exception 'INVALID_NOTE';
  end if;
  if p_expires_at is not null and p_expires_at <= now() then
    raise exception 'INVALID_EXPIRY';
  end if;

  v_requested_count := coalesce((select count(distinct x) from unnest(p_document_ids) as x), 0);
  if v_requested_count < 1 or v_requested_count > 100 then
    raise exception 'DOCUMENT_REQUIRED';
  end if;

  select count(*) into v_document_count
  from yalcinmutlu.documents d
  where d.id = any(p_document_ids)
    and d.is_active = true;

  if v_document_count <> v_requested_count then
    raise exception 'INVALID_DOCUMENT';
  end if;

  update yalcinmutlu.guest_access_links
  set label = trim(p_label),
      note = nullif(trim(coalesce(p_note, '')), ''),
      expires_at = p_expires_at
  where id = p_guest_link_id
    and revoked_at is null;

  if not found then
    return false;
  end if;

  delete from yalcinmutlu.guest_access_documents
  where guest_access_link_id = p_guest_link_id;

  insert into yalcinmutlu.guest_access_documents(guest_access_link_id, document_id, can_download)
  select p_guest_link_id, x, true
  from (select distinct unnest(p_document_ids) as x) s;

  return true;
end;
$$;

revoke all on function public.yalcinmutlu_admin_update_guest_link(text,uuid,text,text,timestamptz,uuid[]) from public, anon, authenticated;
grant execute on function public.yalcinmutlu_admin_update_guest_link(text,uuid,text,text,timestamptz,uuid[]) to service_role;
