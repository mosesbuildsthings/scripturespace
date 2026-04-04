import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "prayer", label: "🙏 Prayer" },
  { value: "bible_reading", label: "📖 Bible Reading" },
  { value: "fasting", label: "🕊️ Fasting" },
  { value: "worship", label: "🎵 Worship" },
  { value: "service", label: "🤝 Service" },
  { value: "fellowship", label: "👥 Fellowship" },
  { value: "memorization", label: "💡 Memorization" },
  { value: "other", label: "✨ Other" },
];

const ICONS = ["✨", "🙏", "📖", "🕊️", "🎵", "🤝", "👥", "💡", "🔥", "⭐", "🌿", "🌅", "✝️", "💪", "🌟"];

export default function NewGoalForm({ user, onCreated, onCancel }) {
  const [form, setForm] = useState({
    title: "", description: "", goal_type: "habit",
    category: "prayer", target_days: "", icon: "✨",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await base44.entities.Goal.create({
      user_email: user.email,
      title: form.title,
      description: form.description || undefined,
      goal_type: form.goal_type,
      category: form.category,
      target_days: form.goal_type === "habit" && form.target_days ? Number(form.target_days) : undefined,
      icon: form.icon,
      completed_dates: [],
      is_active: true,
    });
    setSaving(false);
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border p-5 space-y-4">
      <h3 className="text-base font-semibold text-foreground">New Spiritual Goal</h3>

      {/* Icon Picker */}
      <div className="space-y-1">
        <Label className="text-xs">Icon</Label>
        <div className="flex flex-wrap gap-1.5">
          {ICONS.map(icon => (
            <button
              type="button" key={icon}
              onClick={() => setForm(f => ({ ...f, icon }))}
              className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${
                form.icon === icon ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary hover:bg-accent"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="space-y-1">
        <Label className="text-xs">Type</Label>
        <div className="flex gap-2">
          {["habit", "milestone"].map(t => (
            <button
              type="button" key={t}
              onClick={() => setForm(f => ({ ...f, goal_type: t }))}
              className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                form.goal_type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {t === "habit" ? "📅 Daily Habit" : "🏆 Milestone"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Title *</Label>
        <Input placeholder="e.g. Read Bible for 15 minutes" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="text-sm" required />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Description (optional)</Label>
        <Textarea placeholder="Describe your goal..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="min-h-[70px] text-sm" />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Category</Label>
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full text-sm border border-input rounded-md p-2 bg-background">
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {form.goal_type === "habit" && (
        <div className="space-y-1">
          <Label className="text-xs">Target Days (optional, e.g. 30-day challenge)</Label>
          <Input type="number" min="1" placeholder="e.g. 30" value={form.target_days} onChange={e => setForm(f => ({ ...f, target_days: e.target.value }))} className="text-sm" />
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving || !form.title.trim()} className="rounded-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Goal"}
        </Button>
      </div>
    </form>
  );
}