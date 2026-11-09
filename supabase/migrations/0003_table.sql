-- 0003_tables.sql (Corrected)
-- Core tables, constraints, indexes, and updated_at triggers.

-- 1. Trigger function for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. tournaments (single row for v1)
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year int not null,
  logo_url text,
  start_date date,
  end_date date,
  venue text,
  status tournament_status not null default 'upcoming',
  manual_qualification_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_tournaments_updated_at
before update on public.tournaments
for each row execute function public.set_updated_at();

-- 3. teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  academic_year text not null,
  logo_url text,
  captain_id uuid, 
  vice_captain_id uuid, 
  color text,
  description text,
  final_resolution_rank int, 
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

-- 4. players
create table public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  jersey_number int not null,
  position text not null,
  team_id uuid not null references public.teams(id) on delete cascade,
  is_captain boolean not null default false,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint chk_jersey_number_positive check (jersey_number >= 0),
  constraint uq_team_jersey unique (team_id, jersey_number)
);

create unique index uq_team_one_captain on public.players(team_id) where is_captain = true;

create trigger trg_players_updated_at
before update on public.players
for each row execute function public.set_updated_at();

-- 5. Add FKs to teams for captains
alter table public.teams
  add constraint fk_team_captain foreign key (captain_id) references public.players(id) on delete set null,
  add constraint fk_team_vice_captain foreign key (vice_captain_id) references public.players(id) on delete set null;

-- 6. matches
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  team_a_id uuid not null references public.teams(id) on delete cascade,
  team_b_id uuid not null references public.teams(id) on delete cascade,
  stage match_stage not null,
  match_date date not null,
  kickoff_time timestamptz,
  venue text,
  status match_status not null default 'scheduled',
  team_a_score int,
  team_b_score int,
  team_a_penalty_score int,
  team_b_penalty_score int,
  went_to_extra_time boolean not null default false,
  referee text,
  notes text,
  pair_key text not null, -- Changed to a regular column
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint chk_teams_differ check (team_a_id <> team_b_id),
  constraint chk_scores_non_negative check (
    (team_a_score is null or team_a_score >= 0) and 
    (team_b_score is null or team_b_score >= 0)
  ),
  constraint chk_penalties_non_negative check (
    (team_a_penalty_score is null or team_a_penalty_score >= 0) and 
    (team_b_penalty_score is null or team_b_penalty_score >= 0)
  ),
  
  constraint chk_league_penalties check (
    stage <> 'league' or (team_a_penalty_score is null and team_b_penalty_score is null)
  ),
  
  constraint chk_knockout_completed_penalties check (
    status <> 'completed' or stage = 'league' or (team_a_score <> team_b_score) or 
    (team_a_penalty_score is not null and team_b_penalty_score is not null and team_a_penalty_score <> team_b_penalty_score)
  ),
  
  constraint chk_knockout_completed_no_penalties check (
    status <> 'completed' or stage = 'league' or (team_a_score = team_b_score) or 
    (team_a_penalty_score is null and team_b_penalty_score is null)
  )
);

-- Trigger to calculate pair_key automatically
create or replace function public.set_match_pair_key()
returns trigger
language plpgsql
as $$
begin
  new.pair_key := least(new.team_a_id, new.team_b_id)::text || '|' || 
                  greatest(new.team_a_id, new.team_b_id)::text || '|' || 
                  new.stage::text;
  return new;
end;
$$;

create trigger trg_matches_pair_key
before insert or update of team_a_id, team_b_id, stage on public.matches
for each row execute function public.set_match_pair_key();

-- Unique index on pair_key to prevent duplicate fixtures
create unique index uq_match_pair_key on public.matches(pair_key);

create trigger trg_matches_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

-- 7. match_events
create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  event_type event_type not null,
  minute int not null,
  is_shootout boolean not null default false,
  created_at timestamptz not null default now(),
  
  constraint chk_minute_positive check (minute >= 0)
);

-- 8. tournament_admins
create table public.tournament_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role admin_role not null default 'admin',
  created_at timestamptz not null default now()
);

-- 9. announcements
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_at timestamptz,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_announcements_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

-- 10. audit_logs
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  before jsonb,
  after jsonb,
  at timestamptz not null default now()
);

-- Add indexes for foreign keys to speed up lookups
create index idx_players_team_id on public.players(team_id);
create index idx_matches_team_a on public.matches(team_a_id);
create index idx_matches_team_b on public.matches(team_b_id);
create index idx_match_events_match_id on public.match_events(match_id);
create index idx_match_events_player_id on public.match_events(player_id);