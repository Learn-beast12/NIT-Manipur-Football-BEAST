export type GeneratedFixture = {
  round: number;
  teamAId: string;
  teamBId: string;
};

/**
 * Generates a single round-robin schedule using the Circle Method.
 * @param teamIds An array of UUIDs for the teams.
 * @returns An array of fixtures with round numbers.
 */
export function generateRoundRobinFixtures(teamIds: string[]): GeneratedFixture[] {
  const fixtures: GeneratedFixture[] = [];
  
  // We need a copy of the array so we don't mutate the original
  let teams = [...teamIds];
  
  // If odd number of teams, add a "dummy" team (null) to represent the Bye
  if (teams.length % 2 !== 0) {
    teams.push("BYE");
  }
  
  const numTeams = teams.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  // Loop through each round
  for (let round = 0; round < numRounds; round++) {
    // Loop through the pairs in this round
    for (let match = 0; match < matchesPerRound; match++) {
      const teamA = teams[match];
      const teamB = teams[numTeams - 1 - match];

      // If neither team is the "BYE", add it to the fixtures
      if (teamA !== "BYE" && teamB !== "BYE") {
        fixtures.push({
          round: round + 1,
          teamAId: teamA,
          teamBId: teamB,
        });
      }
    }

    // Rotate the teams (keep the first team fixed, rotate the rest)
    // Move the last element to the second position
    teams.splice(1, 0, teams.pop()!);
  }

  return fixtures;
}