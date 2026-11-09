import { Route, Routes } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import {
  Home,
  Tournament,
  Teams,
  TeamDetail,
  Players,
  Fixtures,
  MatchDetail,
  Results,
  Standings,
  Knockout,
  Champion,
  NotFound,
  AdminLogin,
  AdminOverview,
} from "./pages";

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
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
      </Route>
    </Routes>
  );
}