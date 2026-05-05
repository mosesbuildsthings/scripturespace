import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, Trash2, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function MyCollection({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: savedVerses = [], isLoading } = useQuery({
    queryKey: ["saved-verses", userEmail],
    queryFn: () => base44.entities.SavedVerse.filter({ user_email: userEmail }, "-created_date", 100),
    enabled: !!userEmail,
  });

  const handleDelete = async (id) => {
    await base44.entities.SavedVerse.delete(id);
    queryClient.invalidateQueries({ queryKey: ["saved-verses", userEmail] });
    toast.success("Verse removed from collection.");
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (savedVerses.length === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">No saved verses yet.</p>
        <p className="text-xs text-muted-foreground">Tap any verse in the Bible Reader to save it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{savedVerses.length} saved verse{savedVerses.length !== 1 ? "s" : ""}</p>
      {savedVerses.map(v => (
        <div
          key={v.id}
          className="rounded-xl border p-4 space-y-2 relative"
          style={{ borderLeftWidth: 4, borderLeftColor: v.highlight_color || "#fef08a" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-primary">{v.reference}</span>
              {v.translation && <span className="text-xs text-muted-foreground">({v.translation})</span>}
            </div>
            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(v.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="text-sm italic text-foreground/80 leading-relaxed">"{v.verse_text}"</p>
          {v.note && <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1">📝 {v.note}</p>}
        </div>
      ))}
    </div>
  );
}