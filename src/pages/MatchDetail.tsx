import { useParams, Link } from "react-router-dom";
import { useMatches, useTeams } from "@/features/tournament/hooks";
import { formatMatchDate, formatKickoffTime } from "@/lib/format";
import { Loader2, ArrowLeft } from "lucide-react";

export default function MatchDetail() {
  const { id } = useParams();
  const { data: matches, isLoading: loadingMatches } = useMatches();
  const { data: teams, isLoading: loadingTeams } = useTeams();

  if (loadingMatches || loadingTeams) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const match = matches?.find((m) => m.id === id);

  if (!match) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Match not found</h2>
        <Link to="/fixtures" className="text-primary hover:underline mt-4 inline-block">Back to fixtures</Link>
      </div>
    );
  }

  const teamA = teams?.find((t) => t.id === match.team_a_id);
  const teamB = teams?.find((t) => t.id === match.team_b_id);

  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/fixtures" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to fixtures
      </Link>

      {/* Scoreboard */}
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {match.stage} Stage • {match.venue || "Main Ground"}
        </div>
        <div className="text-sm text-muted-foreground mb-8">
          {formatMatchDate(match.match_date)} • {formatKickoffTime(match.kickoff_time)}
        </div>

        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          {/* Team A */}
          <div className="flex flex-col items-center flex-1">
            <div className="h-20 w-20 rounded-full bg-elevated flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">{teamA?.name.charAt(0) || "?"}</span>
            </div>
            <h2 className="text-xl font-bold text-center">{teamA?.name || "TBD"}</h2>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center">
            {isCompleted || isLive ? (
              <div className="text-6xl font-heading font-bold tabular tracking-tighter flex items-center gap-4">
                <span className={isCompleted && match.team_a_score! > match.team_b_score! ? "text-primary" : ""}>
                  {match.team_a_score ?? 0}
                </span>
                <span className="text-muted-foreground text-4xl">-</span>
                <span className={isCompleted && match.team_b_score! > match.team_a_score! ? "text-primary" : ""}>
                  {match.team_b_score ?? 0}
                </span>
              </div>
            ) : (
              <div className="text-4xl font-heading font-bold text-muted-foreground">VS</div>
            )}
            
            {isLive && (
              <span className="mt-2 inline-flex items-center rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger animate-pulse">
                ● LIVE
              </span>
            )}
            {isCompleted && (
              <span className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">
                Full Time
              </span>
            )}
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center flex-1">
            <div className="h-20 w-20 rounded-full bg-elevated flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">{teamB?.name.charAt(0) || "?"}</span>
            </div>
            <h2 className="text-xl font-bold text-center">{teamB?.name || "TBD"}</h2>
          </div>
        </div>
      </div>

      {/* Events Timeline (Placeholder until Stage 4) */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold mb-4">Match Events</h3>
        <p className="text-sm text-muted-foreground text-center py-6">
          No events recorded yet. Goalscorers and cards will appear here.
        </p>
      </div>
    </div>
  );
}