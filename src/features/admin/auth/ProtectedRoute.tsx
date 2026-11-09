import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute() {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground animate-pulse">Verifying access...</p>
      </div>
    );
  }

  // If no session OR not an admin, redirect to login
  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}