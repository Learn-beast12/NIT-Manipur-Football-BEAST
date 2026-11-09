import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Tournament, Team, Match } from "@/types";
import { useEffect } from "react";

// Helper to subscribe to realtime changes
function useRealtimeSubscription(table: string, queryKey: string[]) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          // When DB changes, refetch the queries
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryClient, queryKey]);
}

export function useTournament() {
  useRealtimeSubscription("tournaments", ["tournament"]);
  return useQuery({
    queryKey: ["tournament"],
    queryFn: async (): Promise<Tournament> => {
      const { data, error } = await supabase.from("tournaments").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useTeams() {
  useRealtimeSubscription("teams", ["teams"]);
  return useQuery({
    queryKey: ["teams"],
    queryFn: async (): Promise<Team[]> => {
      const { data, error } = await supabase.from("teams").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useMatches() {
  useRealtimeSubscription("matches", ["matches"]);
  return useQuery({
    queryKey: ["matches"],
    queryFn: async (): Promise<Match[]> => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true })
        .order("kickoff_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useStandings() {
  useRealtimeSubscription("matches", ["standings"]);
  return useQuery({
    queryKey: ["standings"],
    queryFn: async () => {
      const { data: viewData, error } = await supabase.from("standings_view").select("*");
      if (error) throw error;

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "completed")
        .eq("stage", "league");
        
      if (matchError) throw matchError;
      if (!viewData || !matchData) return [];

      const { sortStandings } = await import("@/features/standings/tieBreaker");
      return sortStandings(viewData as any, matchData as any);
    },
  });
}