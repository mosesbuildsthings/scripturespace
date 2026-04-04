import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { HandHeart, Plus } from "lucide-react";
import PrayerRequestCard from "@/components/prayer/PrayerRequestCard";
import NewPrayerRequestForm from "@/components/prayer/NewPrayerRequestForm";

const CATEGORIES = ["all", "health", "family", "finances", "guidance", "gratitude", "relationships", "other"];

export default function PrayerBoard() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["prayer_requests"],
    queryFn: () => base44.entities.PrayerRequest.list("-created_date", 50),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["prayer_requests"] });

  const filtered = activeCategory === "all"
    ? requests
    : requests.filter(r => r.category === activeCategory);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <HandHeart className="w-6 h-6 text-primary" /> Prayer Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lift each other up in prayer
          </p>
        </div>
        <Button
          size="sm"
          className="rounded-full gap-2 shrink-0"
          onClick={() => setShowForm(v => !v)}
        >
          <Plus className="w-4 h-4" /> Request Prayer
        </Button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <NewPrayerRequestForm
          currentUser={user}
          onCreated={() => { setShowForm(false); refresh(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prayer Requests */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <HandHeart className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground text-sm">No prayer requests yet.</p>
          <p className="text-xs text-muted-foreground">Be the first to share one with the community.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(request => (
            <PrayerRequestCard
              key={request.id}
              request={request}
              currentUser={user}
              onUpdate={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}