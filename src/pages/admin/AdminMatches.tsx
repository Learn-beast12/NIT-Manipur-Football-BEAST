import { useState } from "react";
import { useMatches, useTeams } from "@/features/tournament/hooks";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Wand2 } from "lucide-react";
import { generateRoundRobinFixtures } from "@/features/matches/fixtureGenerator";
import { formatMatchDate } from "@/lib/format";
import { Link } from "react-router-dom";

export default function AdminMatches() {
  const { data: matches, isLoading: loadingMatches } = useMatches();
  const { data: teams, isLoading: loadingTeams } = useTeams();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateFixtures = async () => {
    if (!teams || teams.length < 2) {
      alert("You need at least 2 teams to generate fixtures.");
      return;
    }
    
    if (matches && matches.length > 0) {
      if (!confirm("Matches already exist. Generating new fixtures will overwrite them. Are you sure?")) {
        return;
      }
      // Delete existing matches
      await supabase.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    setIsGenerating(true);

    try {
      // 1. Generate the fixtures in TS
      const teamIds = teams.map(t => t.id);
      const generatedFixtures = generateRoundRobinFixtures(teamIds);

      // 2. Prepare the payload for Supabase
      // We set the dates to start 30 days from today as a default placeholder
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 30);

      const payload = generatedFixtures.map(f => {
        const matchDate = new Date(baseDate);
        // Spread matches out by 2 days per round
        matchDate.setDate(matchDate.getDate() + ((f.round - 1) * 2));
        
        return {
          team_a_id: f.teamAId,
          team_b_id: f.teamBId,
          stage: 'league',
          match_date: matchDate.toISOString().split('T')[0],
          status: 'scheduled',
          venue: 'Main Ground'
        };
      });

      // 3. Insert into database
      const { error } = await supabase.from("matches").insert(payload);
      if (error) throw error;

      // 4. Refresh the list
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      
    } catch (err: any) {
      alert("Error generating fixtures: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingMatches || loadingTeams) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Matches</h1>
          <p className="text-muted-foreground">Generate fixtures and update scores.</p>
        </div>
        
        <button
          onClick={handleGenerateFixtures}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {isGenerating ? "Generating..." : "Generate League Fixtures"}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-elevated/50">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Match</th>
              <th className="px-4 py-3 font-medium text-center">Score</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {matches?.map((match) => {
              const teamA = teams?.find(t => t.id === match.team_a_id);
              const teamB = teams?.find(t => t.id === match.team_b_id);
              
              return (
                <tr key={match.id} className="hover:bg-elevated/30">
                  <td className="px-4 py-3 whitespace-nowrap">{formatMatchDate(match.match_date)}</td>
                  <td className="px-4 py-3 font-medium">
                    {teamA?.name} <span className="text-muted-foreground mx-2">vs</span> {teamB?.name}
                  </td>
                  <td className="px-4 py-3 text-center tabular font-bold">
                    {match.status === 'completed' || match.status === 'live' ? (
                      <span>{match.team_a_score} - {match.team_b_score}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${
                      match.status === 'completed' ? 'bg-muted text-muted-foreground' :
                      match.status === 'live' ? 'bg-danger/10 text-danger animate-pulse' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {match.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link 
                      to={`/admin/matches/${match.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              );
            })}
            {matches?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No matches generated yet. Click the button above to create the schedule.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}