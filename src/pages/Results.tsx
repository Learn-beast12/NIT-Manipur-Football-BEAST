import { useMatches, useTeams } from "@/features/tournament/hooks";
import MatchCard from "@/features/matches/MatchCard";
import { Loader2 } from "lucide-react";

export default function Results() {
  const { data: matches, isLoading: loadingMatches } = useMatches();
  const { data: teams, isLoading: loadingTeams } = useTeams();

  if (loadingMatches || loadingTeams) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const completedMatches = matches?.filter(m => m.status === "completed") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Results</h1>
        <p className="text-muted-foreground">Completed matches and final scores.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {completedMatches.map((match) => (
          <MatchCard key={match.id} match={match} teams={teams || []} />
        ))}
        {completedMatches.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-8">
            No completed matches yet.
          </p>
        )}
      </div>
    </div>
  );
}