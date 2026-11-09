-- 0005_is_admin_function.sql
-- The central security check for all admin RLS policies.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tournament_admins
    where user_id = auth.uid()
  );
$$;