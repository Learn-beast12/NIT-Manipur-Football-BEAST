-- 0008_match_format.sql
-- Add match format rules to the tournament settings.

alter table public.tournaments
  add column half_duration_minutes int not null default 30,
  add column extra_time_half_minutes int not null default 10,
  add column halftime_break_minutes int not null default 10,
  
  -- Add safety checks so you can't accidentally set a 0-minute half
  add constraint chk_half_duration check (half_duration_minutes > 0),
  add constraint chk_extra_time_duration check (extra_time_half_minutes > 0);