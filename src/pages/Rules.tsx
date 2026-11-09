import { BookOpen, Clock3, Flag, Scale, ShieldAlert, Users } from "lucide-react";
import { useTournament } from "@/features/tournament/hooks";

const laws = [
  {
    icon: Users,
    title: "Players and substitutions",
    description:
      "A standard match is played by two teams of up to 11 players each, including a goalkeeper. The Laws set a minimum of seven players to start or continue a match. Substitution limits and squad sizes are competition-specific.",
  },
  {
    icon: Flag,
    title: "Goals and restarts",
    description:
      "A goal is scored when the whole ball crosses the goal line between the posts and beneath the crossbar, provided no offence occurred. Kick-offs, throw-ins, goal kicks and corner kicks restart play in the situations defined by the Laws.",
  },
  {
    icon: Scale,
    title: "Offside",
    description:
      "Offside is optional for this tournament. The organizers will announce whether it applies. If it is in effect, being in an offside position alone is not an offence; a player is penalised only when becoming involved in active play as defined by the offside Law.",
  },
  {
    icon: ShieldAlert,
    title: "Fouls and discipline",
    description:
      "Depending on the offence, the referee may award a direct or indirect free kick, a penalty kick, or take disciplinary action. A yellow card is a caution; a red card sends a player off.",
  },
  {
    icon: BookOpen,
    title: "The referee",
    description:
      "The referee applies the Laws, manages the match and makes decisions on facts connected with play. Players, team officials and spectators are expected to respect match officials and their decisions.",
  },
];

const competitionDetails = [
  "Player eligibility, roster limits and registration deadlines",
  "Whether the optional offside rule is in effect",
  "Extra time, penalty shoot-outs and standings tie-breakers",
  "Suspensions, protests, rescheduling and walkovers",
];

export default function Rules() {
  const { data: tournament, isLoading, error } = useTournament();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          NIT Manipur · Inter-Year Football
        </p>
        <h1 className="text-3xl font-heading font-bold md:text-4xl">
          Rules &amp; Regulations
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          The tournament follows the official IFAB Laws of the Game as its
          playing-rules baseline. This page is a brief guide, not a replacement
          for the official Laws or the event regulations.
        </p>
      </header>

      <section
        aria-label="Important tournament rules notice"
        className="rounded-xl border border-primary/30 bg-primary/5 p-5"
      >
        <h2 className="font-semibold">Tournament-specific regulations</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The Laws leave some matters to each competition. Details for this
          tournament—including eligibility, squad sizes, substitutions,
          offside enforcement, tie-breakers and disciplinary procedures—must be
          confirmed and published by the organizers.
        </p>
      </section>

      <section aria-label="Match duration">
        <article className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-heading text-lg font-semibold">Match duration</h2>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading admin-configured match duration…</p>
          ) : error ? (
            <p role="alert" className="text-sm text-danger">
              Could not load the match duration: {error.message}
            </p>
          ) : tournament ? (
            <p className="text-sm leading-6 text-muted-foreground">
              The tournament admin has set each half to{" "}
              <strong className="text-foreground">{tournament.half_duration_minutes} minutes</strong>
              {" "}and each extra-time half to{" "}
              <strong className="text-foreground">{tournament.extra_time_half_minutes} minutes</strong>.
              The admin may update these settings; this page reflects the current saved values.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Match duration is set by the tournament admin and will be shown here once configured.
            </p>
          )}
        </article>
      </section>

      <section aria-label="Summary of the Laws of the Game" className="grid gap-4 md:grid-cols-2">
        {laws.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-lg font-semibold">{title}</h2>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-heading text-xl font-semibold">
          Event details to be confirmed
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The organizers should publish these competition-specific decisions
          before the tournament begins:
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {competitionDetails.map((detail) => (
            <li key={detail} className="flex gap-2">
              <span className="text-primary" aria-hidden="true">•</span>
              {detail}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-muted-foreground">
        Read the complete{" "}
        <a
          href="https://www.theifab.com/laws/"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          IFAB Laws of the Game
        </a>
        . In the event of any difference, the official Laws and the tournament
        regulations issued by the organizers take precedence over this summary.
      </p>
    </div>
  );
}
