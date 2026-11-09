-- 0004_standings_function.sql
-- Creates a view to calculate standings dynamically from completed league matches.

create or replace view public.standings_view 
with (security_invoker = true) as
with match_results as (
  select
    team_id,
    sum(played) as played,
    sum(won) as won,
    sum(drawn) as drawn,
    sum(lost) as lost,
    sum(gf) as gf,
    sum(ga) as ga,
    sum(gd) as gd,
    sum(points) as points
  from (
    -- Team A perspective
    select
      team_a_id as team_id,
      1 as played,
      case when team_a_score > team_b_score then 1 else 0 end as won,
      case when team_a_score = team_b_score then 1 else 0 end as drawn,
      case when team_a_score < team_b_score then 1 else 0 end as lost,
      team_a_score as gf,
      team_b_score as ga,
      (team_a_score - team_b_score) as gd,
      case 
        when team_a_score > team_b_score then 3 
        when team_a_score = team_b_score then 1 
        else 0 
      end as points
    from public.matches
    where status = 'completed' and stage = 'league' and team_a_score is not null and team_b_score is not null

    union all

    -- Team B perspective
    select
      team_b_id as team_id,
      1 as played,
      case when team_b_score > team_a_score then 1 else 0 end as won,
      case when team_b_score = team_a_score then 1 else 0 end as drawn,
      case when team_b_score < team_a_score then 1 else 0 end as lost,
      team_b_score as gf,
      team_a_score as ga,
      (team_b_score - team_a_score) as gd,
      case 
        when team_b_score > team_a_score then 3 
        when team_b_score = team_a_score then 1 
        else 0 
      end as points
    from public.matches
    where status = 'completed' and stage = 'league' and team_a_score is not null and team_b_score is not null
  ) as individual_team_stats
  group by team_id
)
select
  t.id as team_id,
  t.name as team_name,
  coalesce(m.played, 0) as played,
  coalesce(m.won, 0) as won,
  coalesce(m.drawn, 0) as drawn,
  coalesce(m.lost, 0) as lost,
  coalesce(m.gf, 0) as gf,
  coalesce(m.ga, 0) as ga,
  coalesce(m.gd, 0) as gd,
  coalesce(m.points, 0) as points
from public.teams t
left join match_results m on m.team_id = t.id;