import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BookOpen, HandHeart } from "lucide-react";

export default function SessionProgressChart({ sessionDates = [], answeredPrayerCount = 0 }) {
  // Build last-8-weeks bar chart data from session dates
  const weekData = [];
  const now = new Date();
  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - w * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const count = sessionDates.filter(d => {
      const date = new Date(d);
      return date >= weekStart && date <= weekEnd;
    }).length;

    const label = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    weekData.push({ week: label, sessions: count });
  }

  const totalSessions = sessionDates.length;

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
            <p className="text-xs text-muted-foreground">Study Sessions</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <HandHeart className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{answeredPrayerCount}</p>
            <p className="text-xs text-muted-foreground">Prayers Answered</p>
          </div>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="bg-card rounded-2xl border p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Sessions Per Week</p>
        {totalSessions === 0 ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No study sessions recorded yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weekData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}