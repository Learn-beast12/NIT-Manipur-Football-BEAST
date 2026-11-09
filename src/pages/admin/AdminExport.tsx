import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Download, Loader2 } from "lucide-react";

export default function AdminExport() {
  const [loading, setLoading] = useState<string | null>(null);

  const downloadCSV = async (table: string) => {
    setLoading(table);
    try {
      const { data, error } = await supabase.from(table).select("*");
      if (error) throw error;
      if (!data || data.length === 0) {
        alert("No data to export for " + table);
        return;
      }

      // Convert JSON array to CSV
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map((row) =>
        Object.values(row)
          .map((val) => {
            // Escape quotes and wrap strings in quotes
            if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
            if (val === null) return "";
            return val;
          })
          .join(",")
      );
      const csvContent = [headers, ...rows].join("\n");

      // Create a blob and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `nitmn_${table}_2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert("Export failed: " + err.message);
    } finally {
      setLoading(null);
    }
  };

  const exportOptions = [
    { table: "teams", label: "Teams", desc: "All team names and info" },
    { table: "players", label: "Players", desc: "All registered players" },
    { table: "matches", label: "Matches", desc: "All fixtures and final scores" },
    { table: "match_events", label: "Match Events", desc: "All goals and cards" },
    { table: "standings_view", label: "Standings", desc: "Final points table" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-heading font-bold">Data Export</h1>
        <p className="text-muted-foreground">Download tournament data as CSV files for backups or printing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {exportOptions.map((opt) => (
          <div key={opt.table} className="rounded-lg border border-border bg-surface p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg">{opt.label}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{opt.desc}</p>
            </div>
            <button
              onClick={() => downloadCSV(opt.table)}
              disabled={loading === opt.table}
              className="flex items-center justify-center gap-2 rounded-md bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
            >
              {loading === opt.table ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {loading === opt.table ? "Exporting..." : "Download CSV"}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-elevated p-4 text-sm text-muted-foreground">
        <strong>Backup Note:</strong> Downloading CSVs is a great way to keep a permanent record of the tournament. 
        For a full database backup, refer to the README instructions on using Supabase pg_dump.
      </div>
    </div>
  );
}