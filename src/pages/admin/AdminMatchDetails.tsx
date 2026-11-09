import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useMatches, useTeams } from "@/features/tournament/hooks";
import { supabase } from "@/lib/supabase";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Player, MatchEvent } from "@/types";

export default function AdminMatchDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const { data: matches } = useMatches();
  const { data: teams } = useTeams();
  
  const match = matches?.find(m => m.id === id);
  const teamA = teams?.find(t => t.id === match?.team_a_id);
  const teamB = teams?.find(t => t.id === match?.team_b_id);

  // --- Match Form State ---
  const [status, setStatus] = useState<string>("scheduled");
  const [scoreA, setScoreA] = useState<string>("");
  const [scoreB, setScoreB] = useState<string>("");
  const [wentToExtraTime, setWentToExtraTime] = useState<boolean>(false);
  const [penaltyA, setPenaltyA] = useState<string>("");
  const [penaltyB, setPenaltyB] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // --- Event Form State ---
  const [eventPlayerId, setEventPlayerId] = useState("");
  const [eventType, setEventType] = useState("goal");
  const [eventMinute, setEventMinute] = useState("");
  const [isShootout, setIsShootout] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Fetch players for both teams (for the dropdown)
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

  // Load existing match data into the form
  useEffect(() => {
    if (match) {
      setStatus(match.status);
      setScoreA(match.team_a_score?.toString() ?? "");
      setScoreB(match.team_b_score?.toString() ?? "");
      setWentToExtraTime(match.went_to_extra_time || false);
      setPenaltyA(match.team_a_penalty_score?.toString() ?? "");
      setPenaltyB(match.team_b_penalty_score?.toString() ?? "");
    }
  }, [match]);

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    
    setIsSaving(true);

    // Validation for penalties
    if (status === "completed" && scoreA === scoreB && match.stage !== 'league') {
      if (penaltyA === "" || penaltyB === "" || penaltyA === penaltyB) {
        alert("Tied knockout match requires unequal penalty scores to be completed.");
        setIsSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from("matches")
      .update({
        status,
        team_a_score: scoreA === "" ? null : parseInt(scoreA),
        team_b_score: scoreB === "" ? null : parseInt(scoreB),
        went_to_extra_time: wentToExtraTime,
        team_a_penalty_score: penaltyA === "" ? null : parseInt(penaltyA),
        team_b_penalty_score: penaltyB === "" ? null : parseInt(penaltyB),
      })
      .eq("id", match.id);

    if (error) {
      alert("Error saving match: " + error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["standings"] });
      alert("Match saved successfully!");
    }
    setIsSaving(false);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match || !eventPlayerId || !eventMinute) return;

    setIsAddingEvent(true);
    const { error } = await supabase.from("match_events").insert({
      match_id: match.id,
      player_id: eventPlayerId,
      event_type: eventType,
      minute: parseInt(eventMinute),
      is_shootout: isShootout,
    });

    if (error) {
      alert("Error adding event: " + error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["match_events", id] });
      // Clear form
      setEventPlayerId("");
      setEventMinute("");
      setEventType("goal");
      setIsShootout(false);
    }
    setIsAddingEvent(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("match_events").delete().eq("id", eventId);
    queryClient.invalidateQueries({ queryKey: ["match_events", id] });
  };

  if (!match || !teamA || !teamB) {
    return <div className="p-8 text-center">Match not found.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/admin/matches" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to matches
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* LEFT COLUMN: Match Details Form */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h1 className="mb-4 text-2xl font-heading font-bold">Match Data</h1>
          
          <form onSubmit={handleSaveMatch} className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center flex-1">
                <span className="mb-2 text-sm font-bold text-center">{teamA.name}</span>
                <input
                  type="number" min="0" value={scoreA} onChange={(e) => setScoreA(e.target.value)}
                  className="w-20 rounded-md border border-border bg-background px-3 py-2 text-center text-2xl font-bold focus:border-primary focus:outline-none"
                />
              </div>
              <div className="font-bold text-muted-foreground">VS</div>
              <div className="flex flex-col items-center flex-1">
                <span className="mb-2 text-sm font-bold text-center">{teamB.name}</span>
                <input
                  type="number" min="0" value={scoreB} onChange={(e) => setScoreB(e.target.value)}
                  className="w-20 rounded-md border border-border bg-background px-3 py-2 text-center text-2xl font-bold focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Match Status</label>
              <select
                value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="half_time">Half Time</option>
                <option value="completed">Completed</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Only show for knockout stages */}
            {match.stage !== 'league' && (
              <div className="rounded-md border border-border bg-elevated p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox" id="et" checked={wentToExtraTime} onChange={(e) => setWentToExtraTime(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="et" className="text-sm font-medium">Went to Extra Time?</label>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Penalties:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="0" placeholder="A" value={penaltyA} onChange={(e) => setPenaltyA(e.target.value)}
                      className="w-16 rounded-md border border-border bg-background px-2 py-1 text-center font-bold focus:border-primary focus:outline-none"
                    />
                    <span>-</span>
                    <input
                      type="number" min="0" placeholder="B" value={penaltyB} onChange={(e) => setPenaltyB(e.target.value)}
                      className="w-16 rounded-md border border-border bg-background px-2 py-1 text-center font-bold focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit" disabled={isSaving}
              className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Match Data"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Match Events */}
        <div className="rounded-xl border border-border bg-surface p-6 flex flex-col">
          <h2 className="mb-4 text-xl font-heading font-bold">Match Events</h2>
          
          <form onSubmit={handleAddEvent} className="mb-6 space-y-3 rounded-md border border-border bg-elevated p-4">
            <div className="grid grid-cols-2 gap-2">
              <select
                required value={eventPlayerId} onChange={(e) => setEventPlayerId(e.target.value)}
                className="col-span-2 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Select Player...</option>
                {players?.map(p => (
                  <option key={p.id} value={p.id}>{p.jersey_number} - {p.full_name}</option>
                ))}
              </select>
              
              <select
                value={eventType} onChange={(e) => setEventType(e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              >
                <option value="goal">Goal</option>
                <option value="own_goal">Own Goal</option>
                <option value="yellow">Yellow Card</option>
                <option value="red">Red Card</option>
                <option value="penalty_goal">Penalty Goal</option>
                <option value="penalty_miss">Penalty Miss</option>
              </select>
              
              <input
                type="number" required min="1" placeholder="Minute" value={eventMinute} onChange={(e) => setEventMinute(e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            
            {(eventType === "penalty_goal" || eventType === "penalty_miss") && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox" id="shootout" checked={isShootout} onChange={(e) => setIsShootout(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="shootout" className="text-xs text-muted-foreground">Is Penalty Shootout?</label>
              </div>
            )}

            <button
              type="submit" disabled={isAddingEvent}
              className="w-full flex items-center justify-center gap-1 rounded-md bg-primary/20 py-1.5 text-xs font-semibold text-primary hover:bg-primary/30 disabled:opacity-50"
            >
              <Plus className="h-3 w-3" /> Add Event
            </button>
          </form>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-2">
            {events?.map(event => {
              const player = players?.find(p => p.id === event.player_id);
              return (
                <div key={event.id} className="flex items-center justify-between rounded border border-border bg-background p-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-muted-foreground w-8">{event.minute}'</span>
                    <span className="font-medium">{player?.full_name || "Unknown"}</span>
                    <span className="text-xs uppercase text-primary">{event.event_type.replace('_', ' ')}</span>
                    {event.is_shootout && <span className="text-[10px] bg-gold/20 text-gold px-1 rounded">SO</span>}
                  </div>
                  <button onClick={() => handleDeleteEvent(event.id)} className="text-danger hover:text-red-400 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            {events?.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">No events recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}