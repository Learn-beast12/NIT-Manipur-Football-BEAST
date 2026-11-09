import { Link } from "react-router-dom";
import { useTournament, useTeams, useMatches, useStandings, useAnnouncements } from "@/features/tournament/hooks";
import MatchCard from "@/features/matches/MatchCard";
import { Megaphone, Trophy, CalendarDays, ArrowRight } from "lucide-react";

export function Home() {
  const { data: tournament } = useTournament();
  const { data: teams } = useTeams();
  const { data: matches } = useMatches();
  const { data: standings } = useStandings();
  const { data: announcements } = useAnnouncements();

  const recentMatches = matches?.filter(m => m.status === "completed").slice(-3).reverse() || [];
  const upcomingMatches = matches?.filter(m => m.status === "scheduled" || m.status === "live").slice(0, 3) || [];
  const topTeams = standings?.slice(0, 4) || [];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-surface border border-border p-8 md:p-12 text-center md:text-left">
        <div className="relative z-10 md:w-2/3">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-4">
            {tournament?.status || "Upcoming"}
          </span>
          <h1 className="mb-4 text-4xl font-heading font-bold md:text-5xl lg:text-6xl">
            {tournament?.name || "Inter-Year Football"}
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Follow the {tournament?.year || "2026"} tournament. Live scores, standings, and fixtures all in one place.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link to="/fixtures" className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              View Fixtures
            </Link>
            <Link to="/standings" className="rounded-md border border-border bg-background px-6 py-2.5 text-sm font-semibold hover:bg-elevated">
              Points Table
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements && announcements.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-heading font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" /> Latest News
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {announcements.map(ann => (
              <div key={ann.id} className="rounded-lg border border-border bg-surface p-4">
                <h3 className="font-semibold">{ann.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{ann.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Column: Matches */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> Upcoming Matches
              </h2>
              <Link to="/fixtures" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {upcomingMatches.map(match => (
                <MatchCard key={match.id} match={match} teams={teams || []} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-heading font-bold">Recent Results</h2>
              <Link to="/results" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {recentMatches.map(match => (
                <MatchCard key={match.id} match={match} teams={teams || []} />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Standings Preview */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold" /> Top Teams
            </h2>
            <Link to="/standings" className="text-xs text-primary hover:underline">Full Table</Link>
          </div>
          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            {topTeams.map((team, index) => (
              <div key={team.team_id} className="flex items-center justify-between border-b border-border p-3 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center text-sm font-bold text-muted-foreground">{index + 1}</span>
                  <span className="font-semibold text-sm">{team.team_name}</span>
                </div>
                <div className="text-sm font-bold tabular">{team.points} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Keep your existing exports below this line:
export function Tournament() { return <div>Tournament Page</div>; }
export function TeamDetail() { return <div>Team Detail</div>; }
export function NotFound() { return <div>404 Not Found</div>; }