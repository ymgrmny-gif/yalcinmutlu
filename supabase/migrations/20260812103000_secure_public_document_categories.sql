alter table public.document_categories enable row level security;

revoke insert, update, delete, truncate, references, trigger
on table public.document_categories
from anon, authenticated;

grant select on table public.document_categories to anon, authenticated;

DROP POLICY IF EXISTS document_categories_public_read ON public.document_categories;
create policy document_categories_public_read
on public.document_categories
for select
to anon, authenticated
using (true);
