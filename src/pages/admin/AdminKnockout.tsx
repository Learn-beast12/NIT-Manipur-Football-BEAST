import { useState } from "react";
import { useMatches, useStandings } from "@/features/tournament/hooks";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Swords } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminKnockout() {
  const { data: matches } = useMatches();
  const { data: standings, isLoading } = useStandings();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSemifinals = async () => {
    if (!standings || standings.length < 4) {
      alert("Not enough teams to generate semifinals.");
      return;
    }

    if (matches?.some(m => m.stage === 'semifinal')) {
      if (!confirm("Semifinals already exist. Overwrite them?")) return;
      await supabase.from("matches").delete().eq("stage", "semifinal");
      await supabase.from("matches").delete().eq("stage", "final"); // Delete final too
    }

    setIsGenerating(true);

    try {
      // standings is already sorted by our H2H logic!
      const first = standings[0];
      const second = standings[1];
      const third = standings[2];
      const fourth = standings[3];

      const payload = [
        {
          team_a_id: first.team_id,
          team_b_id: fourth.team_id,
          stage: 'semifinal',
          match_date: new Date().toISOString().split('T')[0],
          status: 'scheduled',
          venue: 'Main Ground'
        },
        {
          team_a_id: second.team_id,
          team_b_id: third.team_id,
          stage: 'semifinal',
          match_date: new Date().toISOString().split('T')[0],
          status: 'scheduled',
          venue: 'Main Ground'
        }
      ];

      const { error } = await supabase.from("matches").insert(payload);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["matches"] });
      alert("Semifinals generated successfully!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const semifinals = matches?.filter(m => m.stage === 'semifinal') || [];
  const final = matches?.find(m => m.stage === 'final');

  const sf1Done = semifinals[0]?.status === 'completed';
  const sf2Done = semifinals[1]?.status === 'completed';

  const handleGenerateFinal = async () => {
    if (!semifinals[0] || !semifinals[1]) return;
    
    // Determine winners (assuming no penalties for simplicity in this snippet)
    const sf1 = semifinals[0];
    const sf2 = semifinals[1];
    
    const winner1 = sf1.team_a_score! > sf1.team_b_score! ? sf1.team_a_id : sf1.team_b_id;
    const winner2 = sf2.team_a_score! > sf2.team_b_score! ? sf2.team_a_id : sf2.team_b_id;

    setIsGenerating(true);
    try {
      await supabase.from("matches").insert({
        team_a_id: winner1,
        team_b_id: winner2,
        stage: 'final',
        match_date: new Date().toISOString().split('T')[0],
        status: 'scheduled',
        venue: 'Main Ground'
      });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      alert("Final generated!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Knockout Stage</h1>
        <p className="text-muted-foreground">Generate semifinals and final matches.</p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" /> Semifinals
        </h2>
        
        {semifinals.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate semifinals once the league stage is finished. This will match 1st vs 4th and 2nd vs 3rd based on the current Points Table.
            </p>
            <button
              onClick={handleGenerateSemifinals}
              disabled={isGenerating}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              Generate Semifinals
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {semifinals.map(sf => (
              <div key={sf.id} className="flex justify-between items-center rounded border border-border p-3">
                <span>{sf.team_a_id} vs {sf.team_b_id}</span>
                <span className="text-sm uppercase text-muted-foreground">{sf.status}</span>
                <Link to={`/admin/matches/${sf.id}`} className="text-sm text-primary hover:underline">Manage</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {semifinals.length === 2 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Final</h2>
          {final ? (
            <div className="flex justify-between items-center rounded border border-border p-3">
              <span>Final Match Generated</span>
              <Link to={`/admin/matches/${final.id}`} className="text-sm text-primary hover:underline">Manage</Link>
            </div>
          ) : (
            <button
              onClick={handleGenerateFinal}
              disabled={!sf1Done || !sf2Done || isGenerating}
              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-background hover:bg-yellow-600 disabled:opacity-50"
            >
              Generate Final (Requires SF completion)
            </button>
          )}
        </div>
      )}
    </div>
  );
}