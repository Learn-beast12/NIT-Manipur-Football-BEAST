-- 0006_rls.sql
-- Enable RLS and define access policies for all tables.

-- ==========================================
-- 1. Enable RLS on all tables
-- ==========================================
alter table public.tournaments enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.tournament_admins enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;
-- Note: standings_view inherits security from its base tables.

-- ==========================================
-- 2. Tournaments
-- ==========================================
create policy "Public can view tournaments"
  on public.tournaments for select
  using (true);

create policy "Admins can insert tournaments"
  on public.tournaments for insert
  with check (public.is_admin());

create policy "Admins can update tournaments"
  on public.tournaments for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete tournaments"
  on public.tournaments for delete
  using (public.is_admin());

-- ==========================================
-- 3. Teams
-- ==========================================
create policy "Public can view teams"
  on public.teams for select
  using (true);

create policy "Admins can insert teams"
  on public.teams for insert
  with check (public.is_admin());

create policy "Admins can update teams"
  on public.teams for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete teams"
  on public.teams for delete
  using (public.is_admin());

-- ==========================================
-- 4. Players
-- ==========================================
create policy "Public can view players"
  on public.players for select
  using (true);

create policy "Admins can insert players"
  on public.players for insert
  with check (public.is_admin());

create policy "Admins can update players"
  on public.players for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete players"
  on public.players for delete
  using (public.is_admin());

-- ==========================================
-- 5. Matches
-- ==========================================
create policy "Public can view matches"
  on public.matches for select
  using (true);

create policy "Admins can insert matches"
  on public.matches for insert
  with check (public.is_admin());

create policy "Admins can update matches"
  on public.matches for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete matches"
  on public.matches for delete
  using (public.is_admin());

-- ==========================================
-- 6. Match Events
-- ==========================================
create policy "Public can view match events"
  on public.match_events for select
  using (true);

create policy "Admins can insert match events"
  on public.match_events for insert
  with check (public.is_admin());

create policy "Admins can update match events"
  on public.match_events for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete match events"
  on public.match_events for delete
  using (public.is_admin());

-- ==========================================
-- 7. Tournament Admins
-- ==========================================
-- Only admins can see who the admins are. No one can insert/delete via API (Service Role only).
create policy "Admins can view admin list"
  on public.tournament_admins for select
  using (public.is_admin());

-- ==========================================
-- 8. Announcements
-- ==========================================
-- Public can only view published announcements. Admins can view all.
create policy "Public can view published announcements"
  on public.announcements for select
  using (is_published = true or public.is_admin());

create policy "Admins can insert announcements"
  on public.announcements for insert
  with check (public.is_admin());

create policy "Admins can update announcements"
  on public.announcements for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete announcements"
  on public.announcements for delete
  using (public.is_admin());

-- ==========================================
-- 9. Audit Logs
-- ==========================================
-- Admins can insert and read. No one can update or delete (append-only).
create policy "Admins can insert audit logs"
  on public.audit_logs for insert
  with check (public.is_admin());

create policy "Admins can view audit logs"
  on public.audit_logs for select
  using (public.is_admin());