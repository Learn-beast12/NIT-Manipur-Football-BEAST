import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/admin/auth/useAuth";
import { signOut } from "@/lib/auth";

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
  const location = useLocation();
  const { session } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to="/admin" className="font-heading text-lg font-bold tracking-wide">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {ADMIN_NAV.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-elevated hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="mb-4 text-xs text-muted-foreground truncate">
            {session?.user.email}
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to public site
            </Link>
            <button
              onClick={() => signOut()}
              className="text-left text-sm text-danger hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-border bg-surface px-6 md:hidden">
          <span className="font-heading font-bold">Admin Panel</span>
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}