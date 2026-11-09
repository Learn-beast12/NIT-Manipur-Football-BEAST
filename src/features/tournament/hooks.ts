import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Tournament, Team, Match } from "@/types";

export function useTournament() {
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

      // Import and use our H2H logic
      const { sortStandings } = await import("@/features/standings/tieBreaker");
      
      // Pass the data through the sorter
      return sortStandings(viewData as any, matchData as any);
    },
  });
}