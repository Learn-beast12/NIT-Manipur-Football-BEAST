import { sortStandings, StandingRow, MatchResult } from "./src/features/standings/tieBreaker";

// 3 Teams tied on Points (6), GD (0), and GF (3)
const standings: StandingRow[] = [
  { team_id: "A", team_name: "Team A", played: 2, won: 2, drawn: 0, lost: 0, gf: 3, ga: 3, gd: 0, points: 6 },
  { team_id: "B", team_name: "Team B", played: 2, won: 2, drawn: 0, lost: 0, gf: 3, ga: 3, gd: 0, points: 6 },
  { team_id: "C", team_name: "Team C", played: 2, won: 2, drawn: 0, lost: 0, gf: 3, ga: 3, gd: 0, points: 6 },
];

// H2H matches:
// Team B beat Team A (2-1)
// Team C beat Team B (2-1)
// Team A beat Team C (2-1)
const matches: MatchResult[] = [
  { team_a_id: "B", team_b_id: "A", team_a_score: 2, team_b_score: 1 },
  { team_a_id: "C", team_b_id: "B", team_a_score: 2, team_b_score: 1 },
  { team_a_id: "A", team_b_id: "C", team_a_score: 2, team_b_score: 1 },
];

const sorted = sortStandings(standings, matches);

console.log("Sorted Table:");
sorted.forEach((t, index) => {
  console.log(`${index + 1}. ${t.team_name}`);
});