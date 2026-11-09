import { useMatches, useTeams } from "@/features/tournament/hooks";
import MatchCard from "@/features/matches/MatchCard";
import { Loader2 } from "lucide-react";

export default function Fixtures() {
  const { data: matches, isLoading: loadingMatches } = useMatches();
  const { data: teams, isLoading: loadingTeams } = useTeams();

  if (loadingMatches || loadingTeams) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const upcomingMatches = matches?.filter(m => m.status === "scheduled" || m.status === "live") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Fixtures</h1>
        <p className="text-muted-foreground">Upcoming matches for the NIT Manipur tournament.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcomingMatches.map((match) => (
          <MatchCard key={match.id} match={match} teams={teams || []} />
        ))}
        {upcomingMatches.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-8">
            No upcoming fixtures scheduled.
          </p>
        )}
      </div>
    </div>
  );
}