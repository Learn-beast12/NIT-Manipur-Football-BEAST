export type StandingRow = {
  team_id: string;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  final_resolution_rank?: number | null; // From the DB
};

export type MatchResult = {
  team_a_id: string;
  team_b_id: string;
  team_a_score: number;
  team_b_score: number;
};

/**
 * Sorts a standings array using the strict 7-step tie-breaker rules.
 */
export function sortStandings(
  standings: StandingRow[],
  matches: MatchResult[]
): StandingRow[] {
  
  // 1. Initial sort by Points, then GD, then GF
  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return 0;
  });

  // 2. Find groups of teams that are tied on Points AND GD AND GF
  // We only apply H2H if they are tied on all three.
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (
      j < sorted.length &&
      sorted[i].points === sorted[j].points &&
      sorted[i].gd === sorted[j].gd &&
      sorted[i].gf === sorted[j].gf
    ) {
      j++;
    }

    // If we found a tie (more than 1 team in this group)
    if (j - i > 1) {
      const tiedTeams = sorted.slice(i, j);
      const sortedTiedTeams = applyHeadToHead(tiedTeams, matches);
      
      // Replace the tied block with the H2H-sorted block
      sorted.splice(i, sortedTiedTeams.length, ...sortedTiedTeams);
    }
    i = j;
  }

  return sorted;
}

/**
 * Creates a mini-league of just the tied teams to break the tie.
 */
function applyHeadToHead(tiedTeams: StandingRow[], allMatches: MatchResult[]): StandingRow[] {
  // 1. Create a lookup map for fast access
  const teamIds = new Set(tiedTeams.map(t => t.team_id));

  // 2. Filter matches to ONLY include matches where BOTH teams are in the tied group
  const h2hMatches = allMatches.filter(
    m => teamIds.has(m.team_a_id) && teamIds.has(m.team_b_id)
  );

  // 3. Calculate mini-league points for each tied team
  const miniStats = new Map<string, { points: number; gd: number; gf: number }>();
  
  tiedTeams.forEach(t => miniStats.set(t.team_id, { points: 0, gd: 0, gf: 0 }));

  h2hMatches.forEach(m => {
    const statsA = miniStats.get(m.team_a_id)!;
    const statsB = miniStats.get(m.team_b_id)!;

    // Update GF and GD
    statsA.gf += m.team_a_score;
    statsA.gd += (m.team_a_score - m.team_b_score);
    statsB.gf += m.team_b_score;
    statsB.gd += (m.team_b_score - m.team_a_score);

    // Update Points
    if (m.team_a_score > m.team_b_score) {
      statsA.points += 3;
    } else if (m.team_a_score < m.team_b_score) {
      statsB.points += 3;
    } else {
      statsA.points += 1;
      statsB.points += 1;
    }
  });

  // 4. Sort the tied teams based on their Mini-League stats
  return [...tiedTeams].sort((a, b) => {
    const statsA = miniStats.get(a.team_id)!;
    const statsB = miniStats.get(b.team_id)!;

    // Mini-league Points
    if (statsA.points !== statsB.points) return statsB.points - statsA.points;
    // Mini-league GD
    if (statsA.gd !== statsB.gd) return statsB.gd - statsA.gd;
    // Mini-league GF
    if (statsA.gf !== statsB.gf) return statsB.gf - statsA.gf;

    // 5. FINAL OVERRIDE: If still tied, use the Admin's manual rank
    const rankA = a.final_resolution_rank ?? 999;
    const rankB = b.final_resolution_rank ?? 999;
    return rankA - rankB;
  });
}