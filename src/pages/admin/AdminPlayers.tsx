import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { useTeams } from "@/features/tournament/hooks";
import { supabase } from "@/lib/supabase";
import { Player } from "@/types";

export default function AdminPlayers() {
  const { data: teams, isLoading: isLoadingTeams, error: teamsError } = useTeams();
  const {
    data: players,
    isLoading: isLoadingPlayers,
    error: playersError,
  } = useQuery({
    queryKey: ["all_players"],
    queryFn: async (): Promise<Player[]> => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("jersey_number");
      if (error) throw error;
      return data;
    },
  });
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const teamIdFromUrl = searchParams.get("teamId") ?? "";

  const [isAdding, setIsAdding] = useState(Boolean(teamIdFromUrl));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [position, setPosition] = useState("");
  const [teamId, setTeamId] = useState(teamIdFromUrl);
  const [isCaptain, setIsCaptain] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (teamIdFromUrl) {
      setTeamId(teamIdFromUrl);
      setIsAdding(true);
      setEditingId(null);
    }
  }, [teamIdFromUrl]);

  function resetForm() {
    setFullName("");
    setJerseyNumber("");
    setPosition("");
    setTeamId(teamIdFromUrl);
    setIsCaptain(false);
    setErrorMessage("");
    setIsAdding(false);
    setEditingId(null);
  }

  function startAdding(selectedTeamId = teamIdFromUrl) {
    setFullName("");
    setJerseyNumber("");
    setPosition("");
    setTeamId(selectedTeamId);
    setIsCaptain(false);
    setErrorMessage("");
    setEditingId(null);
    setIsAdding(true);
  }

  function startEditing(player: Player) {
    setFullName(player.full_name);
    setJerseyNumber(String(player.jersey_number));
    setPosition(player.position);
    setTeamId(player.team_id);
    setIsCaptain(player.is_captain);
    setErrorMessage("");
    setIsAdding(false);
    setEditingId(player.id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const playerData = {
      full_name: fullName.trim(),
      jersey_number: Number(jerseyNumber),
      position: position.trim(),
      team_id: teamId,
      is_captain: isCaptain,
    };

    const result = editingId
      ? await supabase.from("players").update(playerData).eq("id", editingId)
      : await supabase.from("players").insert(playerData);

    if (result.error) {
      setErrorMessage(result.error.message);
    } else {
      await queryClient.invalidateQueries({ queryKey: ["all_players"] });
      await queryClient.invalidateQueries({ queryKey: ["players"] });
      resetForm();
    }

    setIsSubmitting(false);
  }

  async function handleDelete(player: Player) {
    if (!confirm(`Delete ${player.full_name} from this team?`)) return;

    const { error } = await supabase.from("players").delete().eq("id", player.id);
    if (error) {
      setErrorMessage(`Unable to delete ${player.full_name}: ${error.message}`);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["all_players"] });
    await queryClient.invalidateQueries({ queryKey: ["players"] });
  }

  if (isLoadingTeams || isLoadingPlayers) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (teamsError || playersError) {
    return (
      <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
        Unable to load players: {(teamsError || playersError)?.message}
      </p>
    );
  }

  const teamsWithPlayers = teams ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold">Players</h1>
          <p className="text-muted-foreground">Add and manage players for each team.</p>
        </div>
        {!isAdding && !editingId && teamsWithPlayers.length > 0 && (
          <button
            type="button"
            onClick={() => startAdding()}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> Add Player
          </button>
        )}
      </div>

      {teamsWithPlayers.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-muted-foreground">Create a team before adding its players.</p>
          <Link to="/admin/teams" className="mt-3 inline-block text-sm text-primary hover:underline">
            Go to Teams
          </Link>
        </div>
      ) : (
        <>
          {(isAdding || editingId) && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-lg border border-border bg-surface p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {editingId ? "Edit Player" : "Add Player to Team"}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  aria-label="Close player form"
                  className="rounded p-1 text-muted-foreground hover:bg-elevated hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="player-name" className="mb-1 block text-sm text-muted-foreground">
                    Player Name
                  </label>
                  <input
                    id="player-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="player-team" className="mb-1 block text-sm text-muted-foreground">
                    Team
                  </label>
                  <select
                    id="player-team"
                    required
                    value={teamId}
                    onChange={(event) => setTeamId(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="" disabled>Select a team</option>
                    {teamsWithPlayers.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="jersey-number" className="mb-1 block text-sm text-muted-foreground">
                    Jersey Number
                  </label>
                  <input
                    id="jersey-number"
                    type="number"
                    min="0"
                    required
                    value={jerseyNumber}
                    onChange={(event) => setJerseyNumber(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="player-position" className="mb-1 block text-sm text-muted-foreground">
                    Position
                  </label>
                  <input
                    id="player-position"
                    type="text"
                    required
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    placeholder="e.g. Goalkeeper"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isCaptain}
                  onChange={(event) => setIsCaptain(event.target.checked)}
                  className="accent-primary"
                />
                Team captain
              </label>

              {errorMessage && (
                <p role="alert" className="text-sm text-danger">{errorMessage}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Add Player"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-border px-4 py-2 text-sm hover:bg-elevated"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {teamsWithPlayers.map((team) => {
            const teamPlayers = (players ?? []).filter((player) => player.team_id === team.id);

            return (
              <section key={team.id} className="overflow-hidden rounded-lg border border-border bg-surface">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-elevated/50 px-4 py-3">
                  <div>
                    <h2 className="font-semibold">{team.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {teamPlayers.length} {teamPlayers.length === 1 ? "player" : "players"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startAdding(team.id)}
                    className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-elevated"
                  >
                    <Plus className="h-4 w-4" /> Add to {team.name}
                  </button>
                </div>

                {teamPlayers.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No players added to this team yet.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {teamPlayers.map((player) => (
                      <div key={player.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background text-sm font-bold">
                            {player.jersey_number}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{player.full_name}</p>
                            <p className="text-xs text-muted-foreground">{player.position}</p>
                          </div>
                          {player.is_captain && (
                            <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold">
                              Captain
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => startEditing(player)}
                            aria-label={`Edit ${player.full_name}`}
                            className="rounded p-2 text-muted-foreground hover:bg-elevated hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(player)}
                            aria-label={`Delete ${player.full_name}`}
                            className="rounded p-2 text-muted-foreground hover:bg-elevated hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </>
      )}

      {errorMessage && !isAdding && !editingId && (
        <p role="alert" className="text-sm text-danger">{errorMessage}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-4 w-4" />
        Each player is registered to the team selected in the form.
      </div>
    </div>
  );
}
