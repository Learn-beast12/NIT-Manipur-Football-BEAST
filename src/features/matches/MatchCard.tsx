import { Link } from "react-router-dom";
import { Match, Team } from "@/types";
import { formatMatchDate, formatKickoffTime } from "@/lib/format";

type MatchCardProps = {
  match: Match;
  teams: Team[];
};

export default function MatchCard({ match, teams }: MatchCardProps) {
  const teamA = teams.find((t) => t.id === match.team_a_id);
  const teamB = teams.find((t) => t.id === match.team_b_id);

  if (!teamA || !teamB) return null;

  const isCompleted = match.status === "completed";

  return (
    <Link
      to={`/matches/${match.id}`}
      className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/50"
    >
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatMatchDate(match.match_date)}</span>
        <span>
          {match.status === "live" ? (
            <span className="font-bold text-primary animate-pulse">● LIVE</span>
          ) : (
            formatKickoffTime(match.kickoff_time)
          )}
        </span>
      </div>

      <div className="space-y-3">
        {/* Team A */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">{teamA.name}</span>
          <span className={`tabular text-lg ${isCompleted && match.team_a_score! > match.team_b_score! ? 'font-bold text-primary' : ''}`}>
            {isCompleted ? match.team_a_score : "-"}
          </span>
        </div>

        {/* Team B */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">{teamB.name}</span>
          <span className={`tabular text-lg ${isCompleted && match.team_b_score! > match.team_a_score! ? 'font-bold text-primary' : ''}`}>
            {isCompleted ? match.team_b_score : "-"}
          </span>
        </div>
      </div>
      
      {/* Venue / Stage */}
      <div className="mt-4 border-t border-border pt-2 text-xs text-muted-foreground flex justify-between">
        <span>{match.venue || "Main Ground"}</span>
        <span className="uppercase">{match.stage}</span>
      </div>
    </Link>
  );
}