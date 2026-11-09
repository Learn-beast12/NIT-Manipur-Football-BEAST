import { useTeams } from "@/features/tournament/hooks";
import { Link } from "react-router-dom";
import { Loader2, Shield } from "lucide-react";

export default function Teams() {
  const { data: teams, isLoading } = useTeams();

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Teams</h1>
        <p className="text-muted-foreground">Meet the competitors of the 2026 tournament.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {teams?.map((team) => (
          <Link key={team.id} to={`/teams/${team.id}`} className="group rounded-xl border border-border bg-surface p-6 transition-colors hover:border-primary/50">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-elevated">
              <Shield className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-xl font-bold">{team.name}</h2>
            <p className="text-sm text-muted-foreground">{team.academic_year}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}