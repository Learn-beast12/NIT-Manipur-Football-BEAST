import { Link, Outlet } from "react-router-dom";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/teams", label: "Teams" },
  { to: "/admin/players", label: "Players" },
  { to: "/admin/matches", label: "Matches" },
  { to: "/admin/knockout", label: "Knockout" },
  { to: "/admin/announcements", label: "Announcements" },
  { to: "/admin/settings", label: "Settings" },
  { to: "/admin/export", label: "Export" },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-full bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface p-4 md:block">
        <Link
          to="/admin"
          className="mb-6 block font-heading text-sm font-bold uppercase tracking-wider"
        >
          Admin · NITMN IYFT
        </Link>
        <nav className="flex flex-col gap-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-elevated hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <Link
            to="/"
            className="block text-xs text-muted-foreground hover:text-foreground"
          >
            ← Back to public site
          </Link>
        </div>
      </aside>

      <div className="flex-1">
        <header className="border-b border-border bg-surface px-4 py-3 md:hidden">
          <span className="font-heading text-sm font-bold uppercase tracking-wider">
            Admin · NITMN IYFT
          </span>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}