import { useParams, Link } from "react-router-dom";
import { useMatches, useTeams } from "@/features/tournament/hooks";
import { formatMatchDate, formatKickoffTime } from "@/lib/format";
import { Loader2, ArrowLeft, Goal, Square } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Player, MatchEvent } from "@/types";

export default function MatchDetail() {
  const { id } = useParams();
  const { data: matches, isLoading: loadingMatches } = useMatches();
  const { data: teams, isLoading: loadingTeams } = useTeams();

  const match = matches?.find((m) => m.id === id);
  const teamA = teams?.find((t) => t.id === match?.team_a_id);
  const teamB = teams?.find((t) => t.id === match?.team_b_id);

  // Fetch players for both teams
  const { data: players } = useQuery({
    queryKey: ["players", match?.team_a_id, match?.team_b_id],
    queryFn: async (): Promise<Player[]> => {
      if (!match) return [];
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .in("team_id", [match.team_a_id, match.team_b_id]);
      if (error) throw error;
      return data;
    },
    enabled: !!match,
  });

  // Fetch match events
  const { data: events } = useQuery({
    queryKey: ["match_events", id],
    queryFn: async (): Promise<MatchEvent[]> => {
      const { data, error } = await supabase
        .from("match_events")
        .select("*")
        .eq("match_id", id)
        .order("minute", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (loadingMatches || loadingTeams) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Match not found</h2>
        <Link to="/fixtures" className="text-primary hover:underline mt-4 inline-block">Back to fixtures</Link>
      </div>
    );
  }

  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";
  const isPenalties = match.team_a_penalty_score !== null || match.team_b_penalty_score !== null;

  // Separate regular events from shootout events
  const regularEvents = events?.filter(e => !e.is_shootout) || [];
  const shootoutEvents = events?.filter(e => e.is_shootout) || [];

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
              <>
                <div className="text-6xl font-heading font-bold tabular tracking-tighter flex items-center gap-4">
                  <span className={isCompleted && match.team_a_score! > match.team_b_score! ? "text-primary" : ""}>
                    {match.team_a_score ?? 0}
                  </span>
                  <span className="text-muted-foreground text-4xl">-</span>
                  <span className={isCompleted && match.team_b_score! > match.team_a_score! ? "text-primary" : ""}>
                    {match.team_b_score ?? 0}
                  </span>
                </div>
                {isPenalties && (
                  <div className="mt-2 text-sm font-semibold text-gold">
                    Penalties: {match.team_a_penalty_score} - {match.team_b_penalty_score}
                  </div>
                )}
              </>
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
                {match.went_to_extra_time ? "After Extra Time" : "Full Time"}
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

      {/* Match Events Timeline */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold mb-6 border-b border-border pb-2">Match Events</h3>
        
        {regularEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No events recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {regularEvents.map((event) => {
              const player = players?.find(p => p.id === event.player_id);
              const isTeamA = player?.team_id === teamA?.id;
              
              return (
                <div key={event.id} className={`flex items-center gap-4 ${isTeamA ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 text-right ${isTeamA ? 'font-medium' : 'text-muted-foreground'}`}>
                    {isTeamA && player?.full_name}
                  </div>
                  
                  {/* Icon & Minute */}
                  <div className="flex flex-col items-center justify-center w-16">
                    <span className="text-xs text-muted-foreground">{event.minute}'</span>
                    {event.event_type === "goal" || event.event_type === "penalty_goal" ? (
                      <Goal className="h-5 w-5 text-primary my-1" />
                    ) : event.event_type === "own_goal" ? (
                      <Goal className="h-5 w-5 text-danger my-1" />
                    ) : event.event_type === "yellow_card" ? (
                      <Square className="h-4 w-4 text-warning fill-warning my-1" />
                    ) : (
                      <Square className="h-4 w-4 text-danger fill-danger my-1" />
                    )}
                  </div>
                  
                  <div className={`flex-1 text-left ${!isTeamA ? 'font-medium' : 'text-muted-foreground'}`}>
                    {!isTeamA && player?.full_name}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Penalty Shootout Section */}
        {shootoutEvents.length > 0 && (
          <div className="mt-8 border-t border-border pt-6">
            <h4 className="text-md font-semibold mb-4 text-center">Penalty Shootout</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {shootoutEvents.filter(e => players?.find(p => p.id === e.player_id)?.team_id === teamA?.id).map((e) => (
                  <div key={e.id} className="text-sm text-right flex justify-end gap-2">
                    <span>{players?.find(p => p.id === e.player_id)?.full_name}</span>
                    {e.event_type === "penalty_goal" ? <span className="text-primary font-bold">✓</span> : <span className="text-danger font-bold">✗</span>}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {shootoutEvents.filter(e => players?.find(p => p.id === e.player_id)?.team_id === teamB?.id).map((e) => (
                  <div key={e.id} className="text-sm flex gap-2">
                    {e.event_type === "penalty_goal" ? <span className="text-primary font-bold">✓</span> : <span className="text-danger font-bold">✗</span>}
                    <span>{players?.find(p => p.id === e.player_id)?.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}