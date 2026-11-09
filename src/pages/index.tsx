import { Link, useParams } from "react-router-dom";

type Shortcut = {
  to: string;
  label: string;
};

function RoutePage({
  title,
  description,
  shortcuts = [],
  notice = "This page is ready for tournament data, but its data loading and management features have not been implemented yet.",
}: {
  title: string;
  description: string;
  shortcuts?: Shortcut[];
  notice?: string;
}) {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          NITMN Inter-Year Football &middot; 2026
        </p>
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{description}</p>
      </header>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-xl font-semibold">Page setup in progress</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{notice}</p>
      </div>

      {shortcuts.length > 0 && (
        <nav
          aria-label={`${title} related pages`}
          className="flex flex-wrap gap-3"
        >
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.to}
              to={shortcut.to}
              className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
            >
              {shortcut.label}
            </Link>
          ))}
        </nav>
      )}
    </section>
  );
}

export function Home() {
  return (
    <RoutePage
      title="Inter-Year Football Tournament"
      description="Follow the NIT Manipur 2026 tournament from one place."
      shortcuts={[
        { to: "/tournament", label: "Tournament details" },
        { to: "/teams", label: "Browse teams" },
        { to: "/fixtures", label: "View fixtures" },
        { to: "/standings", label: "Check standings" },
      ]}
      notice="The site structure is in place. Tournament records and live updates will appear here once data integration is implemented."
    />
  );
}

export function Tournament() {
  return (
    <RoutePage
      title="Tournament"
      description="Tournament format, dates, and competition details."
      shortcuts={[
        { to: "/teams", label: "Teams" },
        { to: "/fixtures", label: "Fixtures" },
      ]}
    />
  );
}

export function Teams() {
  return (
    <RoutePage
      title="Teams"
      description="Explore the teams competing in the tournament."
      shortcuts={[{ to: "/players", label: "Players" }]}
    />
  );
}

export function TeamDetail() {
  const { id } = useParams();

  return (
    <RoutePage
      title={id ? `Team ${id}` : "Team details"}
      description="Team profile, roster, and tournament performance."
      shortcuts={[
        { to: "/teams", label: "All teams" },
        { to: "/fixtures", label: "Fixtures" },
      ]}
      notice="Team records have not been connected yet, so this route cannot show a team profile."
    />
  );
}

export function Players() {
  return (
    <RoutePage
      title="Players"
      description="Find player profiles and their teams."
      shortcuts={[{ to: "/teams", label: "Browse teams" }]}
    />
  );
}

export function Fixtures() {
  return (
    <RoutePage
      title="Fixtures"
      description="Upcoming matches and the tournament schedule."
      shortcuts={[
        { to: "/results", label: "Results" },
        { to: "/standings", label: "Standings" },
      ]}
    />
  );
}

export function MatchDetail() {
  const { id } = useParams();

  return (
    <RoutePage
      title={id ? `Match ${id}` : "Match details"}
      description="Match information, score, and event timeline."
      shortcuts={[
        { to: "/fixtures", label: "Fixtures" },
        { to: "/results", label: "Results" },
      ]}
      notice="Match records have not been connected yet, so this route cannot show match details."
    />
  );
}

export function Results() {
  return (
    <RoutePage
      title="Results"
      description="Scores and completed match summaries."
      shortcuts={[
        { to: "/fixtures", label: "Fixtures" },
        { to: "/standings", label: "Standings" },
      ]}
    />
  );
}

export function Standings() {
  return (
    <RoutePage
      title="Standings"
      description="Group tables and team rankings."
      shortcuts={[
        { to: "/teams", label: "Teams" },
        { to: "/results", label: "Results" },
      ]}
    />
  );
}

export function Knockout() {
  return (
    <RoutePage
      title="Knockout stage"
      description="Follow the tournament bracket and elimination matches."
      shortcuts={[
        { to: "/fixtures", label: "Fixtures" },
        { to: "/champion", label: "Champion" },
      ]}
    />
  );
}

export function Champion() {
  return (
    <RoutePage
      title="Champion"
      description="The tournament champion will be shown here."
      shortcuts={[
        { to: "/standings", label: "Standings" },
        { to: "/knockout", label: "Knockout stage" },
      ]}
    />
  );
}

export function NotFound() {
  return (
    <RoutePage
      title="Page not found"
      description="The page you requested does not exist."
      shortcuts={[{ to: "/", label: "Return home" }]}
      notice="Check the address and try again."
    />
  );
}

export function AdminLogin() {
  return (
    <RoutePage
      title="Admin sign in"
      description="Administrator access for managing the tournament."
      shortcuts={[{ to: "/", label: "Public site" }]}
      notice="Admin authentication will be implemented in Stage 1. This page does not accept or store credentials yet."
    />
  );
}

export function AdminOverview() {
  return (
    <RoutePage
      title="Admin overview"
      description="Tournament management tools."
      shortcuts={[{ to: "/", label: "Public site" }]}
      notice="Admin authorization and management actions will be implemented in Stage 1 and Stage 4. Do not use this page to manage production data."
    />
  );
}