import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["health", "family", "finances", "guidance", "gratitude", "relationships", "other"];

export default function NewPrayerRequestForm({ currentUser, onCreated, onCancel }) {
  const [form, setForm] = useState({ title: "", content: "", category: "other", is_anonymous: false });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSaving(true);
    await base44.entities.PrayerRequest.create({
      ...form,
      author_name: currentUser?.full_name || "Community Member",
      author_email: currentUser?.email,
      praying_users: [],
    });
    setSaving(false);
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border p-5 space-y-4">
      <h3 className="text-base font-semibold text-foreground">Share a Prayer Request</h3>

      <div className="space-y-1">
        <Label className="text-xs">Title (optional)</Label>
        <Input
          placeholder="e.g. Healing for my mother"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="text-sm"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Prayer Request *</Label>
        <Textarea
          placeholder="Share what you'd like the community to pray for..."
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          className="min-h-[80px] text-sm"
          required
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Category</Label>
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full text-sm border border-input rounded-md p-2 bg-background capitalize"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.is_anonymous}
          onChange={e => setForm(f => ({ ...f, is_anonymous: e.target.checked }))}
          className="rounded"
        />
        Post anonymously
      </label>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={saving || !form.content.trim()} className="rounded-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
        </Button>
      </div>
    </form>
  );
}