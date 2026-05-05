import React from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, BookMarked, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function ReadingHistory({ userEmail }) {
  const { data: progress = [], isLoading: loadingProgress } = useQuery({
    queryKey: ["history-progress", userEmail],
    queryFn: () => base44.entities.BibleProgress.filter({ user_email: userEmail }, "-read_date", 100),
    enabled: !!userEmail,
  });

  const { data: devotionals = [], isLoading: loadingDevotionals } = useQuery({
    queryKey: ["history-devotionals", userEmail],
    queryFn: () => base44.entities.JournalEntry.filter({ user_email: userEmail, entry_type: "devotional" }, "-entry_date", 30),
    enabled: !!userEmail,
  });

  const isLoading = loadingProgress || loadingDevotionals;

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const hasContent = progress.length > 0 || devotionals.length > 0;

  if (!hasContent) {
    return (
      <div className="text-center py-12 space-y-2">
        <BookMarked className="w-10 h-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">No history yet.</p>
        <p className="text-xs text-muted-foreground">Chapters you read and devotionals you complete will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Bible Chapters */}
      {progress.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Chapters Read ({progress.length})
          </h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {progress.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/40 text-sm">
                <span className="font-medium text-foreground">{p.book} {p.chapter}</span>
                <span className="text-xs text-muted-foreground">{p.read_date ? format(new Date(p.read_date), "MMM d, yyyy") : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Devotionals */}
      {devotionals.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5" /> Devotionals Completed ({devotionals.length})
          </h3>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {devotionals.map(d => (
              <div key={d.id} className="py-2 px-3 rounded-lg bg-muted/40 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{d.title || `Devotional — ${d.entry_date}`}</span>
                  <span className="text-xs text-muted-foreground">{d.entry_date ? format(new Date(d.entry_date), "MMM d, yyyy") : ""}</span>
                </div>
                {d.scripture_reference && <p className="text-xs text-primary">{d.scripture_reference}</p>}
                {d.mood && <p className="text-xs text-muted-foreground capitalize">Mood: {d.mood}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}