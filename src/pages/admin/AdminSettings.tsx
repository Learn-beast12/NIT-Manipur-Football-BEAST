import { useState, useEffect } from "react";
import { useTournament } from "@/features/tournament/hooks";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";

export default function AdminSettings() {
  const { data: tournament, isLoading } = useTournament();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const [status, setStatus] = useState("");
  const [halfDuration, setHalfDuration] = useState("");
  const [etDuration, setEtDuration] = useState("");

  useEffect(() => {
    if (tournament) {
      setStatus(tournament.status);
      setHalfDuration(tournament.half_duration_minutes.toString());
      setEtDuration(tournament.extra_time_half_minutes.toString());
    }
  }, [tournament]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("tournaments")
      .update({
        status,
        half_duration_minutes: parseInt(halfDuration),
        extra_time_half_minutes: parseInt(etDuration),
      })
      .eq("id", tournament.id);

    if (error) {
      alert("Error saving settings: " + error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
      alert("Settings saved successfully!");
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Tournament Settings</h1>
        <p className="text-muted-foreground">Manage the global state of the competition.</p>
      </div>

      <form onSubmit={handleSave} className="rounded-lg border border-border bg-surface p-6 space-y-6">
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">Tournament Phase</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="upcoming">Upcoming (Pre-tournament)</option>
            <option value="league">League Stage</option>
            <option value="semifinals">Semifinals</option>
            <option value="final">Final</option>
            <option value="completed">Completed</option>
          </select>
          <p className="text-xs text-muted-foreground mt-2">
            Changing this updates the homepage banner and determines when knockout matches can be generated.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Half Duration (Mins)</label>
            <input
              type="number" min="1" value={halfDuration} onChange={(e) => setHalfDuration(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Extra Time Half (Mins)</label>
            <input
              type="number" min="1" value={etDuration} onChange={(e) => setEtDuration(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <button
            type="submit" disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}