import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Check, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ChallengeCard({ challenge, user, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const myProgress = challenge.participant_progress?.find(p => p.user_email === user?.email);
  const myCompleted = myProgress?.completed_readings || [];
  const totalReadings = (challenge.readings || []).length;
  const allParticipants = challenge.participant_progress || [];

  // Group-wide: what % of all readings are done across all participants
  const totalPossible = totalReadings * Math.max(allParticipants.length, 1);
  const totalDone = allParticipants.reduce((sum, p) => sum + (p.completed_readings || []).length, 0);
  const groupPercent = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
  const myPercent = totalReadings > 0 ? Math.round((myCompleted.length / totalReadings) * 100) : 0;

  const toggleReading = async (book, chapter) => {
    if (!user) return;
    setLoading(true);
    const key = `${book}|${chapter}`;
    const participants = [...(challenge.participant_progress || [])];
    const idx = participants.findIndex(p => p.user_email === user.email);

    if (idx === -1) {
      participants.push({ user_email: user.email, user_name: user.full_name, completed_readings: [key] });
    } else {
      const completed = participants[idx].completed_readings || [];
      if (completed.includes(key)) {
        participants[idx] = { ...participants[idx], completed_readings: completed.filter(k => k !== key) };
      } else {
        participants[idx] = { ...participants[idx], completed_readings: [...completed, key] };
      }
    }

    await base44.entities.Challenge.update(challenge.id, { participant_progress: participants });
    setLoading(false);
    onUpdate();
  };

  return (
    <div className="bg-muted/40 rounded-xl p-3 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-foreground">{challenge.title}</p>
          {challenge.description && <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>}
        </div>
        <div className="flex gap-1 shrink-0">
          {challenge.end_date && <Badge variant="outline" className="text-xs">{format(new Date(challenge.end_date), "MMM d")}</Badge>}
        </div>
      </div>

      {/* Group Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Group Progress</span>
          <span className="text-xs font-semibold text-primary">{groupPercent}%</span>
        </div>
        <div className="h-2.5 bg-background rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${groupPercent}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{allParticipants.length} participant{allParticipants.length !== 1 ? "s" : ""}</p>
      </div>

      {/* My Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">My Progress</span>
          <span className="text-xs font-semibold text-green-600">{myPercent}%</span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${myPercent}%` }} />
        </div>
      </div>

      {/* Reading Checklist */}
      <div className="grid grid-cols-2 gap-1.5">
        {(challenge.readings || []).map((r) => {
          const key = `${r.book}|${r.chapter}`;
          const isDone = myCompleted.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleReading(r.book, r.chapter)}
              disabled={loading}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all text-left",
                isDone
                  ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                  : "bg-background border-border text-foreground hover:border-primary/40"
              )}
            >
              {isDone ? <Check className="w-3 h-3 shrink-0" /> : <BookOpen className="w-3 h-3 shrink-0 opacity-40" />}
              <span className="truncate">{r.book} {r.chapter}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}