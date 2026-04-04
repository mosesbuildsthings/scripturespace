import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, Target, Trophy, Flame, BarChart2 } from "lucide-react";
import GoalCard from "@/components/growth/GoalCard";
import NewGoalForm from "@/components/growth/NewGoalForm";
import GrowthCharts from "@/components/growth/GrowthCharts";

const TABS = ["goals", "charts"];
const TAB_LABELS = { goals: "My Goals", charts: "Growth Charts" };

export default function Growth() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("goals");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["goals", user?.email],
    enabled: !!user,
    queryFn: () => base44.entities.Goal.filter({ user_email: user.email, is_active: true }, "-created_date", 50),
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journal_entries_growth", user?.email],
    enabled: !!user,
    queryFn: () => base44.entities.JournalEntry.filter({ user_email: user.email }, "-entry_date", 60),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["goals", user?.email] });

  // Summary stats
  const today = new Date().toISOString().slice(0, 10);
  const habits = goals.filter(g => g.goal_type === "habit");
  const milestones = goals.filter(g => g.goal_type === "milestone");
  const doneToday = habits.filter(g => (g.completed_dates || []).includes(today)).length;
  const totalStreak = habits.reduce((acc, g) => {
    const sorted = [...(g.completed_dates || [])].sort().reverse();
    let streak = 0, cursor = new Date(); cursor.setHours(0,0,0,0);
    for (const d of sorted) {
      const date = new Date(d); date.setHours(0,0,0,0);
      if (Math.round((cursor - date) / 86400000) <= 1) { streak++; cursor = date; } else break;
    }
    return acc + streak;
  }, 0);
  const achievedMilestones = milestones.filter(g => g.is_milestone_achieved).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Spiritual Growth
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track habits, milestones, and your journey with God</p>
        </div>
        <Button size="sm" className="rounded-full gap-2 shrink-0" onClick={() => { setShowForm(v => !v); setActiveTab("goals"); }}>
          <Plus className="w-4 h-4" /> New Goal
        </Button>
      </div>

      {/* Stats Row */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl border p-4 text-center">
            <p className="text-2xl font-bold text-primary">{doneToday}/{habits.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Done Today</p>
          </div>
          <div className="bg-card rounded-2xl border p-4 text-center">
            <p className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1"><Flame className="w-5 h-5" />{totalStreak}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Streak Days</p>
          </div>
          <div className="bg-card rounded-2xl border p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{achievedMilestones}/{milestones.length || 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Milestones</p>
          </div>
        </div>
      )}

      {/* New Goal Form */}
      {showForm && user && (
        <NewGoalForm
          user={user}
          onCreated={() => { setShowForm(false); refresh(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {tab === "goals" ? <Target className="w-3.5 h-3.5" /> : <BarChart2 className="w-3.5 h-3.5" />}
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "goals" && (
        <>
          {goalsLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <TrendingUp className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground text-sm">No goals yet.</p>
              <p className="text-xs text-muted-foreground">Set a daily habit or a spiritual milestone to start tracking your growth.</p>
              <Button size="sm" className="rounded-full mt-3 gap-2" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4" /> Create your first goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Daily Habits
                  </h2>
                  {habits.map(g => <GoalCard key={g.id} goal={g} onUpdate={refresh} onDelete={refresh} />)}
                </div>
              )}
              {milestones.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" /> Milestones
                  </h2>
                  {milestones.map(g => <GoalCard key={g.id} goal={g} onUpdate={refresh} onDelete={refresh} />)}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === "charts" && (
        <GrowthCharts goals={goals} journalEntries={journalEntries} />
      )}
    </div>
  );
}