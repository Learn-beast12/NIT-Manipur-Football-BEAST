import { Link, NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/tournament", label: "Tournament" },
  { to: "/teams", label: "Teams" },
  { to: "/players", label: "Players" },
  { to: "/fixtures", label: "Fixtures" },
  { to: "/results", label: "Results" },
  { to: "/standings", label: "Standings" },
  { to: "/knockout", label: "Knockout" },
  { to: "/champion", label: "Champion" },
  { to: "/standings", label: "Standings(view)" },
];

export default function PublicLayout() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary font-heading text-lg font-bold text-primary-foreground">
              N
            </span>
            <span className="leading-tight">
              <span className="block font-heading text-sm font-bold uppercase tracking-wider">
                NIT Manipur
              </span>
              <span className="block text-xs text-muted-foreground">
                Inter-Year Football · 2026
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-elevated text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/admin/login"
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="container flex-1 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="container flex flex-col gap-1 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>
            © 2026 NIT Manipur · Inter-Year Football Tournament
          </span>
          <span>NITMN IYFT</span>
        </div>
      </footer>
    </div>
  );
}