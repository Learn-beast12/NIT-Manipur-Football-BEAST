import { useState } from "react";
import { Link } from "react-router-dom";
import { useTeams } from "@/features/tournament/hooks";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Edit2, Shield } from "lucide-react";
import { Team } from "@/types";

export default function AdminTeams() {
  const { data: teams, isLoading } = useTeams();
  const queryClient = useQueryClient();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [color, setColor] = useState("#10B981");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setAcademicYear("");
    setColor("#10B981");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEditClick = (team: Team) => {
    setName(team.name);
    setAcademicYear(team.academic_year);
    setColor(team.color || "#10B981");
    setEditingId(team.id);
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (editingId) {
      // Update existing team
      const { error } = await supabase
        .from("teams")
        .update({ name, academic_year: academicYear, color })
        .eq("id", editingId);

      if (error) alert("Error updating team: " + error.message);
      else {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        resetForm();
      }
    } else {
      // Create new team
      const { error } = await supabase.from("teams").insert({
        name,
        academic_year: academicYear,
        color,
      });

      if (error) alert("Error creating team: " + error.message);
      else {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        resetForm();
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete ${teamName}? This will also delete all their matches and players.`)) return;

    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) {
      alert("Error deleting team: " + error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["standings"] });
      queryClient.invalidateQueries({ queryKey: ["all_players"] });
    }
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Teams</h1>
          <p className="text-muted-foreground">Manage the teams in the tournament.</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> Add Team
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Edit Team" : "Add New Team"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Team Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="e.g. 1st Year"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Academic Year</label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="e.g. 1st Year"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Team Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-border bg-background"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Team"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-elevated"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-elevated/50">
            <tr>
              <th className="px-4 py-3 font-medium">Team Name</th>
              <th className="px-4 py-3 font-medium">Academic Year</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teams?.map((team) => (
              <tr key={team.id} className="hover:bg-elevated/30">
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" style={{ color: team.color || '#10B981' }} />
                  {team.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{team.academic_year}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/players?teamId=${team.id}`}
                      className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-elevated hover:text-foreground"
                    >
                      Players
                    </Link>
                    <button
                      onClick={() => handleEditClick(team)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(team.id, team.name)}
                      className="p-1.5 text-muted-foreground hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {teams?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No teams added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}