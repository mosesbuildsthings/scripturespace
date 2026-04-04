import React from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS = { devotional: "Devotional", reflection: "Reflection", answered_prayer: "Answered Prayer" };
const TYPE_COLORS = {
  devotional: "bg-blue-100 text-blue-700",
  reflection: "bg-purple-100 text-purple-700",
  answered_prayer: "bg-green-100 text-green-700",
};
const MOOD_EMOJI = { grateful: "🙏", hopeful: "🌅", struggling: "💙", peaceful: "☮️", joyful: "😊", seeking: "🔍" };

export default function JournalEntryCard({ entry, onDelete }) {
  const handleDelete = async () => {
    await base44.entities.JournalEntry.delete(entry.id);
    onDelete();
  };

  const dateLabel = entry.entry_date
    ? format(new Date(entry.entry_date), "MMMM d, yyyy")
    : "";

  return (
    <div className="bg-card rounded-2xl border p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[entry.entry_type] || TYPE_COLORS.reflection}`}>
              {TYPE_LABELS[entry.entry_type] || "Entry"}
            </span>
            {entry.mood && (
              <span className="text-xs text-muted-foreground">{MOOD_EMOJI[entry.mood]} {entry.mood}</span>
            )}
          </div>
          {entry.title && <p className="text-sm font-semibold text-foreground">{entry.title}</p>}
          <p className="text-xs text-muted-foreground">{dateLabel}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" onClick={handleDelete}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {entry.scripture_reference && (
        <p className="text-xs text-primary flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> {entry.scripture_reference}
        </p>
      )}

      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{entry.content}</p>

      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}