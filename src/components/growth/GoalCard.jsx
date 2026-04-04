import React from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { CheckCircle2, Circle, Trophy, Trash2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_LABELS = {
  prayer: "Prayer", bible_reading: "Bible Reading", fasting: "Fasting",
  worship: "Worship", service: "Service", fellowship: "Fellowship",
  memorization: "Memorization", other: "Other",
};

function calcStreak(completedDates) {
  if (!completedDates?.length) return 0;
  const sorted = [...completedDates].sort().reverse();
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const d of sorted) {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const diff = Math.round((cursor - date) / 86400000);
    if (diff <= 1) { streak++; cursor = date; }
    else break;
  }
  return streak;
}

export default function GoalCard({ goal, onUpdate, onDelete }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const completedDates = goal.completed_dates || [];
  const doneToday = completedDates.includes(today);
  const streak = calcStreak(completedDates);
  const progress = goal.target_days ? Math.min(completedDates.length / goal.target_days, 1) : null;

  const toggleToday = async () => {
    const updated = doneToday
      ? completedDates.filter(d => d !== today)
      : [...completedDates, today];
    await base44.entities.Goal.update(goal.id, { completed_dates: updated });
    onUpdate();
  };

  const achieveMilestone = async () => {
    await base44.entities.Goal.update(goal.id, {
      is_milestone_achieved: true,
      milestone_achieved_date: today,
    });
    onUpdate();
  };

  const handleDelete = async () => {
    await base44.entities.Goal.delete(goal.id);
    onDelete();
  };

  const isHabit = goal.goal_type === "habit";

  return (
    <div className={`bg-card rounded-2xl border p-4 space-y-3 transition-all ${doneToday && isHabit ? "border-primary/40 bg-primary/5" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{goal.icon || "✨"}</span>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{goal.title}</p>
            <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[goal.category] || "Other"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isHabit && streak > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3" /> {streak}
            </span>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {goal.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{goal.description}</p>
      )}

      {/* Progress bar for habits with target */}
      {isHabit && goal.target_days && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedDates.length} / {goal.target_days} days</span>
            <span>{Math.round((progress || 0) * 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(progress || 0) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Habit toggle */}
      {isHabit && (
        <button
          onClick={toggleToday}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
            doneToday
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          {doneToday ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
          {doneToday ? "Done today ✓" : "Mark done for today"}
        </button>
      )}

      {/* Milestone toggle */}
      {!isHabit && (
        <button
          onClick={achieveMilestone}
          disabled={goal.is_milestone_achieved}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
            goal.is_milestone_achieved
              ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          <Trophy className="w-4 h-4" />
          {goal.is_milestone_achieved
            ? `Achieved on ${goal.milestone_achieved_date ? format(new Date(goal.milestone_achieved_date), "MMM d") : ""}` 
            : "Mark as achieved"}
        </button>
      )}
    </div>
  );
}