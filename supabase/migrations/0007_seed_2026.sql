-- 0007_seed_2026.sql
-- Insert the single tournament row for 2026.

insert into public.tournaments (
  name,
  year,
  venue,
  status,
  manual_qualification_enabled
) values (
  'NIT Manipur Inter-Year Football Tournament',
  2026,
  'NIT Manipur Main Ground',
  'upcoming',
  false
);