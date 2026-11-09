import { useMatches, useTeams } from "@/features/tournament/hooks";
import { Loader2, Trophy } from "lucide-react";

export default function Champion() {
  const { data: matches, isLoading: loadingMatches } = useMatches();
  const { data: teams, isLoading: loadingTeams } = useTeams();

  if (loadingMatches || loadingTeams) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const finalMatch = matches?.find(m => m.stage === "final");

  if (!finalMatch) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Trophy className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-3xl font-heading font-bold">Champion TBD</h1>
        <p className="text-muted-foreground mt-2">The final match has not been scheduled yet.</p>
      </div>
    );
  }

  const isCompleted = finalMatch.status === "completed";
  
  // Determine winner
  let winnerId = null;
  if (isCompleted) {
    if (finalMatch.team_a_score! > finalMatch.team_b_score!) winnerId = finalMatch.team_a_id;
    else if (finalMatch.team_b_score! > finalMatch.team_a_score!) winnerId = finalMatch.team_b_id;
    else {
      // Penalty winner
      if (finalMatch.team_a_penalty_score! > finalMatch.team_b_penalty_score!) winnerId = finalMatch.team_a_id;
      else winnerId = finalMatch.team_b_id;
    }
  }

  const winner = teams?.find(t => t.id === winnerId);

  if (!isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Trophy className="h-16 w-16 text-primary mb-4 animate-bounce" />
        <h1 className="text-3xl font-heading font-bold">Final is Underway</h1>
        <p className="text-muted-foreground mt-2">The champion will be crowned once the final match concludes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gold blur-3xl opacity-20 rounded-full"></div>
        <Trophy className="h-32 w-32 text-gold relative z-10 drop-shadow-[0_0_15px_rgba(245,197,24,0.5)]" />
      </div>
      
      <div>
        <h1 className="text-xl font-semibold uppercase tracking-[0.3em] text-gold mb-2">Champions</h1>
        <h2 className="text-5xl font-heading font-bold text-foreground">{winner?.name}</h2>
        <p className="text-muted-foreground mt-2">NIT Manipur Inter-Year Football {new Date().getFullYear()} Winners</p>
      </div>

      <div className="rounded-xl border border-gold/30 bg-surface p-6 max-w-md w-full mt-8">
        <h3 className="font-heading font-bold text-lg mb-4">Final Match Result</h3>
        <div className="flex justify-between items-center text-lg">
          <span className="font-semibold">{teams?.find(t => t.id === finalMatch.team_a_id)?.name}</span>
          <span className="font-bold tabular text-2xl">
            {finalMatch.team_a_score} - {finalMatch.team_b_score}
          </span>
          <span className="font-semibold">{teams?.find(t => t.id === finalMatch.team_b_id)?.name}</span>
        </div>
        {finalMatch.team_a_penalty_score !== null && (
          <div className="text-sm text-gold mt-2">
            (Penalties: {finalMatch.team_a_penalty_score} - {finalMatch.team_b_penalty_score})
          </div>
        )}
      </div>
    </div>
  );
}