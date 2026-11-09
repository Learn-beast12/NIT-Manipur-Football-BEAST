-- 0009_generate_fixtures.sql
-- Generates a single round-robin league schedule for all teams in the tournament.

create or replace function public.generate_league_fixtures()
returns void
language plpgsql
security definer
as $$
declare
  v_team_ids uuid[];
  v_num_teams int;
  v_rounds int;
  v_matches_per_round int;
  v_team_a uuid;
  v_team_b uuid;
  i int;
  j int;
  temp_id uuid;
begin
  -- 1. Fetch all team IDs into an array
  select array_agg(id) into v_team_ids from public.teams;
  
  if v_team_ids is null then
    raise exception 'No teams found. Add teams before generating fixtures.';
  end if;

  v_num_teams := array_length(v_team_ids, 1);

  -- If odd number of teams, we can't easily do a circle method in pure SQL without a dummy team.
  -- For simplicity, this function assumes an even number of teams for now.
  if v_num_teams % 2 != 0 then
    raise exception 'Fixture generation requires an even number of teams. You have %.', v_num_teams;
  end if;

  -- 2. Prevent duplicate generation
  if exists (select 1 from public.matches where stage = 'league') then
    raise exception 'League fixtures already exist.';
  end if;

  v_rounds := v_num_teams - 1;
  v_matches_per_round := v_num_teams / 2;

  -- 3. Circle Method
  for i in 0..(v_rounds - 1) loop
    for j in 1..v_matches_per_round loop
      v_team_a := v_team_ids[j];
      v_team_b := v_team_ids[v_num_teams - j + 1];

      -- Insert the match (Date defaults to today + i days just as a placeholder)
      insert into public.matches (
        team_a_id, team_b_id, stage, match_date, status
      ) values (
        v_team_a, v_team_b, 'league', current_date + i, 'scheduled'
      );
    end loop;

    -- Rotate the array (keep the first element fixed, move the last to the second position)
    temp_id := v_team_ids[v_num_teams];
    for j in reverse v_num_teams..3 loop
      v_team_ids[j] := v_team_ids[j - 1];
    end loop;
    v_team_ids[2] := temp_id;
  end loop;
end;
$$;