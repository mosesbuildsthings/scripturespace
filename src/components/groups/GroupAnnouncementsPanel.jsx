import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Megaphone, Pin, Trash2, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function GroupAnnouncementsPanel({ group, user, isLeader }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", message: "" });
  const [saving, setSaving] = useState(false);

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements", group.id],
    queryFn: () => base44.entities.Announcement.filter({ group_id: group.id }),
    staleTime: 30_000,
  });

  const pinned = announcements.filter(a => a.is_pinned);
  const refresh = () => qc.invalidateQueries({ queryKey: ["announcements", group.id] });

  const handleCreate = async () => {
    if (!form.message.trim()) return;
    setSaving(true);
    await base44.entities.Announcement.create({
      group_id: group.id,
      group_name: group.name,
      author_email: user.email,
      author_name: user.full_name || user.email,
      title: form.title,
      message: form.message,
      is_pinned: true,
    });
    setForm({ title: "", message: "" });
    setShowForm(false);
    setSaving(false);
    refresh();
    toast.success("Announcement pinned to the group!");
  };

  const handleDelete = async (id) => {
    await base44.entities.Announcement.delete(id);
    refresh();
  };

  const handleUnpin = async (a) => {
    await base44.entities.Announcement.update(a.id, { is_pinned: false });
    refresh();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-1.5">
          <Megaphone className="w-3.5 h-3.5 text-primary" /> Announcements
        </p>
        {isLeader && (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showForm ? "Cancel" : "Post"}
          </Button>
        )}
      </div>

      {/* Create form */}
      {showForm && isLeader && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Title (optional)</Label>
            <Input
              placeholder="e.g. Sunday Service Update"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Message *</Label>
            <Textarea
              placeholder="Write your announcement..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="min-h-[60px] text-sm resize-none"
            />
          </div>
          <Button size="sm" className="w-full gap-1.5" disabled={saving || !form.message.trim()} onClick={handleCreate}>
            <Pin className="w-3.5 h-3.5" /> {saving ? "Pinning..." : "Pin Announcement"}
          </Button>
        </div>
      )}

      {/* Pinned announcements */}
      {pinned.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground py-1">
          {isLeader ? "No announcements yet. Post one above!" : "No pinned announcements."}
        </p>
      )}

      {pinned.map(a => (
        <div key={a.id} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Pin className="w-3 h-3 text-amber-500 shrink-0" />
              {a.title && <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">{a.title}</p>}
            </div>
            {isLeader && (
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleUnpin(a)} className="text-muted-foreground hover:text-foreground transition-colors" title="Unpin">
                  <Pin className="w-3 h-3" />
                </button>
                <button onClick={() => handleDelete(a.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-foreground leading-relaxed">{a.message}</p>
          <p className="text-[10px] text-muted-foreground">
            {a.author_name} · {a.created_date ? format(new Date(a.created_date), "MMM d, yyyy") : ""}
          </p>
        </div>
      ))}
    </div>
  );
}