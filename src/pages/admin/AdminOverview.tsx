import { useNavigate } from "react-router-dom";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/features/admin/auth/useAuth";

export default function AdminOverview() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <p className="text-muted-foreground">
            Logged in as: <span className="text-foreground">{session?.user.email}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-elevated"
        >
          Sign Out
        </button>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold">Dashboard placeholder</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Authentication is working! In Stage 4, this area will contain team management, match scores, and tournament settings.
        </p>
      </div>
    </div>
  );
}