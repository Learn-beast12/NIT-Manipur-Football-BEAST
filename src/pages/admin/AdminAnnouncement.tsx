import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Plus, Megaphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Announcement } from "@/features/tournament/hooks";

export default function AdminAnnouncements() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all announcements (admin can see drafts too)
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin_announcements"],
    queryFn: async (): Promise<Announcement[]> => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from("announcements").insert({
      title,
      body,
      is_published: true,
      published_at: new Date().toISOString(),
    });

    if (error) {
      alert(error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin_announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] }); // Update public site
      setIsAdding(false);
      setTitle("");
      setBody("");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Announcements</h1>
          <p className="text-muted-foreground">Post news and updates to the homepage.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> New Post
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" /> New Announcement
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Title</label>
              <input
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Message</label>
              <textarea
                required rows={3} value={body} onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">
              {isSubmitting ? "Publishing..." : "Publish"}
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-elevated">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading announcements...</p>
        ) : announcements?.map((ann) => (
          <div key={ann.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{ann.title}</h3>
              <span className="text-xs text-muted-foreground">
                {new Date(ann.published_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{ann.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}