-- Notifications table: bell dropdown source (AdminShell) + Realtime
-- Run this file in the Supabase dashboard SQL Editor (the only DDL channel for this project).

-- 1. (Optional QA fixtures) create a throwaway non-admin account with:
--    POST /auth/v1/signup { email, password } then set its role with:
--    update auth.users set email_confirmed_at = now(),
--      raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', '"travel"')
--    where email = '<probe-email>';

-- 2. Table + RLS.
drop table if exists public.notifications cascade;

create table public.notifications (
  id text primary key,
  user_id uuid,
  title text,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "notifications_read" on public.notifications;
create policy "notifications_read" on public.notifications for select
to authenticated
using ( user_id = (select auth.uid()) or public.is_admin() );

drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update" on public.notifications for update
to authenticated
using ( user_id = (select auth.uid()) or public.is_admin() )
with check ( user_id = (select auth.uid()) or public.is_admin() );

drop policy if exists "notifications_insert" on public.notifications;
create policy "notifications_insert" on public.notifications for insert
to authenticated
with check ( public.is_admin() );

drop policy if exists "notifications_delete" on public.notifications;
create policy "notifications_delete" on public.notifications for delete
to authenticated
using ( public.is_admin() );

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.notifications to authenticated;
notify pgrst, 'reload schema';

-- 3. Seed: one set of notifications per admin account that exists.
delete from public.notifications;

with tpl (ord, title, message, is_read, ago) as (
  values
    (1, 'Pesanan menunggu konfirmasi', 'Pesanan BRS-26111401 menunggu konfirmasi pembayaran.', false, interval '12 minutes'),
    (2, 'Dokumen jamaah belum lengkap', 'Dokumen paspor 3 jamaah keberangkatan Januari belum lengkap.', false, interval '1 hour'),
    (3, 'Pencairan dana berhasil', 'Pencairan dana ke Bank Mandiri berhasil diproses.', false, interval '3 hours'),
    (4, 'Travel memperbarui profil', 'An-Nahl memperbarui profil travel.', true, interval '1 day'),
    (5, 'Invoice jatuh tempo', 'Invoice INV-20261103-011 jatuh tempo besok.', true, interval '2 days')
),
targets (uid) as (
  select id from auth.users
  where raw_app_meta_data ->> 'role' = 'admin'
)
insert into public.notifications (id, user_id, title, message, is_read, created_at)
select 'ntf-' || tpl.ord || '-' || substring(targets.uid::text from 1 for 8),
       targets.uid, tpl.title, tpl.message, tpl.is_read, now() - tpl.ago
from targets cross join tpl;

-- 4. Realtime.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;
end
$$;

-- 5. Verify.
select email, email_confirmed_at is not null as confirmed, raw_app_meta_data ->> 'role' as role
from auth.users
where raw_app_meta_data ->> 'role' = 'admin'
order by email;

select user_id, count(*) as rows_total, count(*) filter (where not is_read) as unread
from public.notifications
group by user_id
order by user_id;
