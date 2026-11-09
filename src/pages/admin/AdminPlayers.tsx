import { useMatches, useTeams, useTournament } from "@/features/tournament/hooks";
import { Link } from "react-router-dom";
import { Users, Shield, Calendar, CheckCircle, Activity } from "lucide-react";

export default function AdminOverview() {
  const { data: teams } = useTeams();
  const { data: matches } = useMatches();
  const { data: tournament } = useTournament();

  const totalTeams = teams?.length || 0;
  const totalMatches = matches?.length || 0;
  const completedMatches = matches?.filter(m => m.status === "completed").length || 0;
  const liveMatches = matches?.filter(m => m.status === "live").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back. Here is the current status of the {tournament?.name || "Tournament"}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Teams</p>
              <p className="text-2xl font-bold">{totalTeams}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Matches</p>
              <p className="text-2xl font-bold">{totalMatches}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-success/10 p-3 text-success">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedMatches}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-danger/10 p-3 text-danger">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Live Now</p>
              <p className="text-2xl font-bold">{liveMatches}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Quick Actions
          </h2>
          <div className="space-y-2">
            <Link to="/admin/teams" className="block rounded-md border border-border p-3 text-sm hover:bg-elevated">
              Manage Teams & Players
            </Link>
            <Link to="/admin/matches" className="block rounded-md border border-border p-3 text-sm hover:bg-elevated">
              Update Match Scores
            </Link>
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Tournament Status</h2>
          <div className="flex items-center justify-between rounded-md bg-background p-4 border border-border">
            <span className="text-sm text-muted-foreground">Current Phase</span>
            <span className="font-bold uppercase tracking-wider text-primary">{tournament?.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}