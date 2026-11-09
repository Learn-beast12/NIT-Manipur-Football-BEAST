import { useStandings } from "@/features/tournament/hooks";
import { Loader2 } from "lucide-react";

export default function Standings() {
  const { data: standings, isLoading, error } = useStandings();
  console.log("Standings Data:", standings); // ADD THIS LINE
  console.log("Loading:", isLoading);         // ADD THIS LINE
  console.log("Error:", error);               // ADD THIS LINE

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-danger">Error loading standings.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Points Table</h1>
        <p className="text-muted-foreground">League stage standings for the 2026 tournament.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Pos</th>
              <th className="px-4 py-3 font-medium">Team</th>
              <th className="px-4 py-3 text-center font-medium">P</th>
              <th className="px-4 py-3 text-center font-medium">W</th>
              <th className="px-4 py-3 text-center font-medium">D</th>
              <th className="px-4 py-3 text-center font-medium">L</th>
              <th className="px-4 py-3 text-center font-medium">GF</th>
              <th className="px-4 py-3 text-center font-medium">GA</th>
              <th className="px-4 py-3 text-center font-medium">GD</th>
              <th className="px-4 py-3 text-center font-bold text-primary">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {standings?.map((row, index) => (
              <tr key={row.team_id} className="hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3 font-medium">{index + 1}</td>
                <td className="px-4 py-3 font-semibold">{row.team_name}</td>
                <td className="px-4 py-3 text-center">{row.played}</td>
                <td className="px-4 py-3 text-center">{row.won}</td>
                <td className="px-4 py-3 text-center">{row.drawn}</td>
                <td className="px-4 py-3 text-center">{row.lost}</td>
                <td className="px-4 py-3 text-center">{row.gf}</td>
                <td className="px-4 py-3 text-center">{row.ga}</td>
                <td className="px-4 py-3 text-center">
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="px-4 py-3 text-center font-bold text-primary">
                  {row.points}
                </td>
              </tr>
            ))}
            {standings?.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                  No standings available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}