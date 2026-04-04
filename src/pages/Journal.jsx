import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { NotebookPen, Plus, Lock } from "lucide-react";
import JournalEntryCard from "@/components/journal/JournalEntryCard";
import NewJournalEntryForm from "@/components/journal/NewJournalEntryForm";

const FILTER_TYPES = ["all", "reflection", "devotional", "answered_prayer"];
const FILTER_LABELS = { all: "All", reflection: "Reflections", devotional: "Devotionals", answered_prayer: "Answered Prayers" };

export default function Journal() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["journal_entries", user?.email],
    enabled: !!user,
    queryFn: () => base44.entities.JournalEntry.filter({ user_email: user.email }, "-entry_date", 100),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["journal_entries", user?.email] });

  const filtered = activeFilter === "all" ? entries : entries.filter(e => e.entry_type === activeFilter);

  // Stats
  const answeredCount = entries.filter(e => e.entry_type === "answered_prayer").length;
  const totalDays = new Set(entries.map(e => e.entry_date)).size;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <NotebookPen className="w-6 h-6 text-primary" /> My Journal
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Private — only you can see these entries
          </p>
        </div>
        <Button size="sm" className="rounded-full gap-2 shrink-0" onClick={() => setShowForm(v => !v)}>
          <Plus className="w-4 h-4" /> New Entry
        </Button>
      </div>

      {/* Stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Entries", value: entries.length },
            { label: "Days Journaled", value: totalDays },
            { label: "Answered Prayers", value: answeredCount },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-2xl border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* New Entry Form */}
      {showForm && user && (
        <NewJournalEntryForm
          user={user}
          onCreated={() => { setShowForm(false); refresh(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === type
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {FILTER_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Entries */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <NotebookPen className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground text-sm">No entries yet.</p>
          <p className="text-xs text-muted-foreground">Start your spiritual journal — record reflections, answered prayers, and growth moments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(entry => (
            <JournalEntryCard key={entry.id} entry={entry} onDelete={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}