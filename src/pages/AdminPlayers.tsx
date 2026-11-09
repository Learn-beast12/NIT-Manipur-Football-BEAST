import { useState } from "react";
import { useTeams } from "@/features/tournament/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, User } from "lucide-react";
import { Player } from "@/types";

export default function AdminPlayers() {
  const { data: teams, isLoading: loadingTeams } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const queryClient = useQueryClient();

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [fullName, setFullName] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [position, setPosition] = useState("Forward");
  const [isCaptain, setIsCaptain] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch players for the selected team
  const { data: players, isLoading: loadingPlayers } = useQuery({
    queryKey: ["players", selectedTeamId],
    queryFn: async (): Promise<Player[]> => {
      if (!selectedTeamId) return [];
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", selectedTeamId)
        .order("jersey_number");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTeamId, // Only fetch if a team is selected
  });

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    
    setIsSubmitting(true);

    const { error } = await supabase.from("players").insert({
      team_id: selectedTeamId,
      full_name: fullName,
      jersey_number: parseInt(jerseyNumber),
      position,
      is_captain: isCaptain,
    });

    if (error) {
      if (error.code === "23505") {
        alert("Error: Jersey number already taken in this team!");
      } else {
        alert("Error creating player: " + error.message);
      }
    } else {
      queryClient.invalidateQueries({ queryKey: ["players", selectedTeamId] });
      setIsAdding(false);
      setFullName("");
      setJerseyNumber("");
      setIsCaptain(false);
      setPosition("Forward");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Players</h1>
          <p className="text-muted-foreground">Manage team rosters.</p>
        </div>
        
        {/* Team Selector */}
        <select
          value={selectedTeamId}
          disabled={loadingTeams}
          onChange={(e) => {
            setSelectedTeamId(e.target.value);
            setIsAdding(false);
          }}
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">{loadingTeams ? "Loading teams..." : "Select a Team..."}</option>
          {teams?.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {!selectedTeamId ? (
        <div className="rounded-lg border border-border border-dashed p-12 text-center text-muted-foreground">
          Select a team above to view their roster.
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" /> Add Player
              </button>
            )}
          </div>

          {isAdding && (
            <form onSubmit={handleCreatePlayer} className="rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-4 text-lg font-semibold">Add Player</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Full Name</label>
                  <input
                    type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Jersey Number</label>
                  <input
                    type="number" required min="1" max="99" value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Position</label>
                  <select
                    value={position} onChange={(e) => setPosition(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="Goalkeeper">Goalkeeper</option>
                    <option value="Defender">Defender</option>
                    <option value="Midfielder">Midfielder</option>
                    <option value="Forward">Forward</option>
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox" checked={isCaptain} onChange={(e) => setIsCaptain(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    Is Team Captain?
                  </label>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="submit" disabled={isSubmitting}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Player"}
                </button>
                <button
                  type="button" onClick={() => setIsAdding(false)}
                  className="rounded-md border border-border px-4 py-2 text-sm hover:bg-elevated"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            {loadingPlayers ? (
              <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : players?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No players added to this team yet.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-elevated/50">
                  <tr>
                    <th className="px-4 py-3 font-medium w-16 text-center">#</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Position</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {players?.map((player) => (
                    <tr key={player.id} className="hover:bg-elevated/30">
                      <td className="px-4 py-3 text-center font-bold text-muted-foreground">{player.jersey_number}</td>
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {player.full_name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{player.position}</td>
                      <td className="px-4 py-3">
                        {player.is_captain && <span className="inline-flex items-center rounded-full bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold">Captain</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}