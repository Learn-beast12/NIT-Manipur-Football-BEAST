import { useMatches, useTeams } from "@/features/tournament/hooks";
import { Link } from "react-router-dom";
import { Loader2, Trophy } from "lucide-react";

export default function Knockout() {
  const { data: matches, isLoading: loadingMatches } = useMatches();
  const { data: teams, isLoading: loadingTeams } = useTeams();

  if (loadingMatches || loadingTeams) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const semifinals = matches?.filter(m => m.stage === 'semifinal') || [];
  const final = matches?.find(m => m.stage === 'final');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Knockout Stage</h1>
        <p className="text-muted-foreground">The road to the championship.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-8">
        {/* Semifinals Column */}
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <h2 className="text-center font-bold text-muted-foreground uppercase tracking-widest text-sm mb-2">Semifinals</h2>
          
          {semifinals.map(sf => {
            const teamA = teams?.find(t => t.id === sf.team_a_id);
            const teamB = teams?.find(t => t.id === sf.team_b_id);
            const isCompleted = sf.status === 'completed';

            return (
              <Link to={`/matches/${sf.id}`} key={sf.id} className="block rounded-lg border border-border bg-surface p-4 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${isCompleted && sf.team_a_score! > sf.team_b_score! ? 'text-primary' : ''}`}>{teamA?.name || 'TBD'}</span>
                  <span className="font-bold tabular">{isCompleted ? sf.team_a_score : '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isCompleted && sf.team_b_score! > sf.team_a_score! ? 'text-primary' : ''}`}>{teamB?.name || 'TBD'}</span>
                  <span className="font-bold tabular">{isCompleted ? sf.team_b_score : '-'}</span>
                </div>
              </Link>
            );
          })}
          {semifinals.length === 0 && <div className="text-center text-muted-foreground p-4 border border-dashed border-border rounded-lg">Not generated yet</div>}
        </div>

        {/* Connector */}
        <div className="hidden md:block h-px w-16 bg-border"></div>

        {/* Final Column */}
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <h2 className="text-center font-bold text-gold uppercase tracking-widest text-sm mb-2 flex items-center justify-center gap-2"><Trophy className="h-4 w-4"/> Final</h2>
          
          {final ? (
            <Link to={`/matches/${final.id}`} className="block rounded-lg border border-gold/30 bg-surface p-4 shadow-[0_0_15px_rgba(245,197,24,0.1)] hover:border-gold transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className={`font-medium ${final.status === 'completed' && final.team_a_score! > final.team_b_score! ? 'text-gold' : ''}`}>{teams?.find(t => t.id === final.team_a_id)?.name || 'TBD'}</span>
                <span className="font-bold tabular">{final.status === 'completed' ? final.team_a_score : '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${final.status === 'completed' && final.team_b_score! > final.team_a_score! ? 'text-gold' : ''}`}>{teams?.find(t => t.id === final.team_b_id)?.name || 'TBD'}</span>
                <span className="font-bold tabular">{final.status === 'completed' ? final.team_b_score : '-'}</span>
              </div>
            </Link>
          ) : (
            <div className="text-center text-muted-foreground p-4 border border-dashed border-border rounded-lg">TBD</div>
          )}
        </div>
      </div>
    </div>
  );
}