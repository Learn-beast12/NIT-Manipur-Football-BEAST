-- 0002_enums.sql
-- All PostgreSQL ENUM types used by the schema.

-- Tournament lifecycle
create type tournament_status as enum (
  'upcoming',
  'league',
  'semifinals',
  'final',
  'completed'
);

-- Match stage
create type match_stage as enum (
  'league',
  'semifinal',
  'final'
);

-- Match lifecycle
create type match_status as enum (
  'scheduled',
  'live',
  'half_time',
  'completed',
  'postponed',
  'cancelled'
);

-- Match event types (is_shootout flag distinguishes penalty goals/misses)
create type event_type as enum (
  'goal',
  'own_goal',
  'yellow',
  'red',
  'penalty_goal',
  'penalty_miss'
);

-- Admin role (only 'admin' for v1; extensible)
create type admin_role as enum (
  'admin'
);