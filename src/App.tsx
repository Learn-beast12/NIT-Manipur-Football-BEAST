import { Route, Routes } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./features/admin/auth/ProtectedRoute";

// Public Pages (Keep the old ones from index.tsx)
import {
  Home,
  Tournament,
  Teams,
  TeamDetail,
  Players,
  Knockout,
  Champion,
  NotFound,
} from "./pages";

// New Pages (Extracted from the placeholder file)
import Standings from "./pages/Standings";
import Fixtures from "./pages/Fixtures";
import Results from "./pages/Results";
import MatchDetail from "./pages/MatchDetail";

// New Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminOverview from "./pages/admin/AdminOverview";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/tournament" element={<Tournament />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/players" element={<Players />} />
        <Route path="/fixtures" element={<Fixtures />} />
        <Route path="/matches/:id" element={<MatchDetail />} />
        <Route path="/results" element={<Results />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/knockout" element={<Knockout />} />
        <Route path="/champion" element={<Champion />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="teams" element={<AdminOverview />} />
          <Route path="players" element={<AdminOverview />} />
          
        </Route>
      </Route>
    </Routes>
  );
}