export type Tournament = {
  id: string;
  name: string;
  year: number;
  venue: string;
  status: 'upcoming' | 'league' | 'semifinals' | 'final' | 'completed';
  half_duration_minutes: number;
  extra_time_half_minutes: number;
};

export type Team = {
  id: string;
  name: string;
  academic_year: string;
  logo_url: string | null;
  color: string | null;
  description: string | null;
};

export type Player = {
  id: string;
  team_id: string;
  full_name: string;
  jersey_number: number;
  position: string;
  is_captain: boolean;
};

export type Match = {
  id: string;
  team_a_id: string;
  team_b_id: string;
  stage: 'league' | 'semifinal' | 'final';
  match_date: string;
  kickoff_time: string | null;
  status: 'scheduled' | 'live' | 'half_time' | 'completed' | 'postponed' | 'cancelled';
  team_a_score: number | null;
  team_b_score: number | null;
  team_a_penalty_score: number | null;
  team_b_penalty_score: number | null;
  went_to_extra_time: boolean;
  venue: string | null;
};