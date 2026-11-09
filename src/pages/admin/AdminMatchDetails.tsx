import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMatches, useTeams } from "@/features/tournament/hooks";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

export default function AdminMatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: matches } = useMatches();
  const { data: teams } = useTeams();
  
  const match = matches?.find(m => m.id === id);
  const teamA = teams?.find(t => t.id === match?.team_a_id);
  const teamB = teams?.find(t => t.id === match?.team_b_id);

  // Local state for the form
  const [status, setStatus] = useState<string>("scheduled");
  const [scoreA, setScoreA] = useState<string>("");
  const [scoreB, setScoreB] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Load existing match data into the form when the page opens
  useEffect(() => {
    if (match) {
      setStatus(match.status);
      setScoreA(match.team_a_score?.toString() ?? "");
      setScoreB(match.team_b_score?.toString() ?? "");
    }
  }, [match]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match) return;
    
    setIsSaving(true);

    // If status is completed, scores cannot be empty
    if (status === "completed" && (scoreA === "" || scoreB === "")) {
      alert("You must enter scores to mark a match as completed.");
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from("matches")
      .update({
        status,
        team_a_score: scoreA === "" ? null : parseInt(scoreA),
        team_b_score: scoreB === "" ? null : parseInt(scoreB),
      })
      .eq("id", match.id);

    if (error) {
      alert("Error saving match: " + error.message);
    } else {
      // Force the public pages to refresh their data
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["standings"] });
      
      // Show a brief success toast or just navigate back
      navigate("/admin/matches");
    }
    setIsSaving(false);
  };

  if (!match || !teamA || !teamB) {
    return <div className="p-8 text-center">Match not found.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/admin/matches" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to matches
      </Link>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="mb-6 text-2xl font-heading font-bold text-center">Manage Match</h1>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center justify-center gap-8">
            {/* Team A */}
            <div className="flex flex-col items-center text-center flex-1">
              <span className="mb-2 text-lg font-bold">{teamA.name}</span>
              <input
                type="number"
                min="0"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                className="w-24 rounded-md border border-border bg-background px-3 py-2 text-center text-2xl font-bold focus:border-primary focus:outline-none"
                placeholder="-"
              />
            </div>

            <div className="text-2xl font-bold text-muted-foreground">VS</div>

            {/* Team B */}
            <div className="flex flex-col items-center text-center flex-1">
              <span className="mb-2 text-lg font-bold">{teamB.name}</span>
              <input
                type="number"
                min="0"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                className="w-24 rounded-md border border-border bg-background px-3 py-2 text-center text-2xl font-bold focus:border-primary focus:outline-none"
                placeholder="-"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Match Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}