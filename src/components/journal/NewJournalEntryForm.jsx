import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const ENTRY_TYPES = [
  { value: "reflection", label: "Personal Reflection" },
  { value: "answered_prayer", label: "Answered Prayer" },
  { value: "devotional", label: "Devotional Note" },
];
const MOODS = ["grateful", "hopeful", "struggling", "peaceful", "joyful", "seeking"];
const MOOD_EMOJI = { grateful: "🙏", hopeful: "🌅", struggling: "💙", peaceful: "☮️", joyful: "😊", seeking: "🔍" };

export default function NewJournalEntryForm({ user, onCreated, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    entry_type: "reflection",
    scripture_reference: "",
    mood: "",
    entry_date: format(new Date(), "yyyy-MM-dd"),
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSaving(true);
    await base44.entities.JournalEntry.create({
      user_email: user.email,
      title: form.title || undefined,
      content: form.content,
      entry_type: form.entry_type,
      scripture_reference: form.scripture_reference || undefined,
      mood: form.mood || undefined,
      entry_date: form.entry_date,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    });
    setSaving(false);
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border p-5 space-y-4">
      <h3 className="text-base font-semibold text-foreground">New Journal Entry</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Entry Type</Label>
          <select
            value={form.entry_type}
            onChange={e => setForm(f => ({ ...f, entry_type: e.target.value }))}
            className="w-full text-sm border border-input rounded-md p-2 bg-background"
          >
            {ENTRY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            value={form.entry_date}
            onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))}
            className="text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Title (optional)</Label>
        <Input
          placeholder="Give this entry a title..."
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="text-sm"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Your Thoughts *</Label>
        <Textarea
          placeholder="Write freely — this is your private space..."
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          className="min-h-[120px] text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Scripture Reference (optional)</Label>
        <Input
          placeholder="e.g. Romans 8:28"
          value={form.scripture_reference}
          onChange={e => setForm(f => ({ ...f, scripture_reference: e.target.value }))}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Mood</Label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button
              type="button"
              key={m}
              onClick={() => setForm(f => ({ ...f, mood: f.mood === m ? "" : m }))}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                form.mood === m ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {MOOD_EMOJI[m]} {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Tags (comma-separated, optional)</Label>
        <Input
          placeholder="e.g. faith, healing, grace"
          value={form.tags}
          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          className="text-sm"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving || !form.content.trim()} className="rounded-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Entry"}
        </Button>
      </div>
    </form>
  );
}