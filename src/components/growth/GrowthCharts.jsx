import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { format, subDays, parseISO } from "date-fns";

function getLast30Days() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), 29 - i);
    return format(d, "yyyy-MM-dd");
  });
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return format(d, "yyyy-MM-dd");
  });
}

export default function GrowthCharts({ goals, journalEntries }) {
  const last30 = getLast30Days();
  const last7 = getLast7Days();

  // Daily completion count over last 30 days
  const completionData = useMemo(() => {
    return last30.map(date => {
      const count = goals.filter(g =>
        g.goal_type === "habit" && (g.completed_dates || []).includes(date)
      ).length;
      return { date: format(parseISO(date), "MMM d"), count };
    });
  }, [goals]);

  // Per-goal weekly completion heatmap (last 7 days)
  const habitGoals = goals.filter(g => g.goal_type === "habit").slice(0, 5);
  const weeklyData = useMemo(() => {
    return last7.map(date => {
      const entry = { day: format(parseISO(date), "EEE") };
      habitGoals.forEach(g => {
        entry[g.title.length > 12 ? g.title.slice(0, 12) + "…" : g.title] =
          (g.completed_dates || []).includes(date) ? 1 : 0;
      });
      return entry;
    });
  }, [goals]);

  // Journal mood over last 30 days
  const moodOrder = ["struggling", "seeking", "hopeful", "peaceful", "grateful", "joyful"];
  const moodData = useMemo(() => {
    return last30.filter((_, i) => i % 3 === 0).map(date => {
      const entry = journalEntries.find(e => e.entry_date === date);
      return {
        date: format(parseISO(date), "MMM d"),
        mood: entry?.mood ? moodOrder.indexOf(entry.mood) + 1 : null,
        moodLabel: entry?.mood || null,
      };
    }).filter(d => d.mood !== null);
  }, [journalEntries]);

  const COLORS = ["hsl(25,45%,42%)", "hsl(160,35%,45%)", "hsl(210,30%,45%)", "hsl(40,50%,55%)", "hsl(340,35%,55%)"];

  return (
    <div className="space-y-6">
      {/* Daily Completions */}
      <div className="bg-card rounded-2xl border p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Daily Habit Completions — Last 30 Days</h3>
        {goals.filter(g => g.goal_type === "habit").length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">Add some habits to see your progress here.</p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={completionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [`${v} habits`, "Completed"]} />
              <Bar dataKey="count" fill="hsl(25,45%,42%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Per-habit weekly heatmap */}
      {habitGoals.length > 0 && (
        <div className="bg-card rounded-2xl border p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Weekly Habit Tracker — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 1]} hide />
              <Tooltip formatter={(v, name) => [v ? "✓ Done" : "✗ Missed", name]} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {habitGoals.map((g, i) => (
                <Bar
                  key={g.id}
                  dataKey={g.title.length > 12 ? g.title.slice(0, 12) + "…" : g.title}
                  fill={COLORS[i % COLORS.length]}
                  radius={[3, 3, 0, 0]}
                  stackId="a"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mood over time */}
      {moodData.length > 1 && (
        <div className="bg-card rounded-2xl border p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Spiritual Mood Over Time</h3>
          <p className="text-xs text-muted-foreground">Based on your journal entries</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={moodData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30,15%,88%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[1, 6]} tickFormatter={(v) => ["", "😔", "🔍", "🌅", "☮️", "🙏", "😊"][v] || ""} />
              <Tooltip formatter={(v) => [["", "struggling", "seeking", "hopeful", "peaceful", "grateful", "joyful"][v], "Mood"]} />
              <Line type="monotone" dataKey="mood" stroke="hsl(25,45%,42%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}