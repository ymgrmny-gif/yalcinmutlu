revoke all on function public.create_guest_account_password_only(text,text,timestamptz,text) from public, anon, authenticated;
revoke all on function public.verify_guest_password(text) from public, anon, authenticated;

grant execute on function public.create_guest_account_password_only(text,text,timestamptz,text) to service_role;
grant execute on function public.verify_guest_password(text) to service_role;
