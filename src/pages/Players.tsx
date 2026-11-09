import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useTeams } from "@/features/tournament/hooks";
import { Player } from "@/types";
import { Loader2 } from "lucide-react";

export default function Players() {
  const { data: teams, isLoading: loadingTeams } = useTeams();
  const { data: players, isLoading: loadingPlayers } = useQuery({
    queryKey: ["all_players"],
    queryFn: async (): Promise<Player[]> => {
      const { data, error } = await supabase.from("players").select("*").order("jersey_number");
      if (error) throw error;
      return data;
    },
  });

  if (loadingTeams || loadingPlayers) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Players</h1>
        <p className="text-muted-foreground">All registered players in the tournament.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {teams?.map((team) => {
          const teamPlayers = players?.filter(p => p.team_id === team.id) || [];
          if (teamPlayers.length === 0) return null;

          return (
            <div key={team.id} className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="bg-elevated px-4 py-3 border-b border-border">
                <h2 className="font-bold text-lg">{team.name}</h2>
              </div>
              <div className="divide-y divide-border">
                {teamPlayers.map(player => (
                  <div key={player.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border">
                        <span className="text-xs font-bold">{player.jersey_number}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{player.full_name}</p>
                        <p className="text-xs text-muted-foreground">{player.position}</p>
                      </div>
                    </div>
                    {player.is_captain && (
                      <span className="text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full">C</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}