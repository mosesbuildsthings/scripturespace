import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export default function ChapterGrid({ book, readChapters, onToggle, loading }) {
  if (!book) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{book.name}</h3>
        <span className="text-xs text-muted-foreground">
          {readChapters.length} / {book.chapters} chapters
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(readChapters.length / book.chapters) * 100}%` }}
        />
      </div>
      <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5">
        {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => {
          const isRead = readChapters.includes(ch);
          return (
            <button
              key={ch}
              onClick={() => !loading && onToggle(ch, isRead)}
              disabled={loading}
              className={cn(
                "aspect-square rounded-md text-xs font-medium flex items-center justify-center transition-all",
                isRead
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {isRead ? <Check className="w-3 h-3" /> : ch}
            </button>
          );
        })}
      </div>
    </div>
  );
}