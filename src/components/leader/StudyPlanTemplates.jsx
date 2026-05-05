import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookMarked, Plus, Trash2, Copy, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function StudyPlanTemplates({ user }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", verses: "", tags: "" });

  const { data: templates = [] } = useQuery({
    queryKey: ["study-templates", user?.email],
    queryFn: () => base44.entities.StudyPlanTemplate.filter({ created_by: user.email }),
    enabled: !!user?.email,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["study-templates", user?.email] });

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await base44.entities.StudyPlanTemplate.create({
      title: form.title.trim(),
      description: form.description.trim(),
      verses: form.verses.split("\n").map(v => v.trim()).filter(Boolean),
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      created_by: user.email,
      creator_name: user.full_name || user.email,
    });
    setForm({ title: "", description: "", verses: "", tags: "" });
    setShowForm(false);
    setSaving(false);
    refresh();
    toast.success("Template saved!");
  };

  const handleDelete = async (id) => {
    await base44.entities.StudyPlanTemplate.delete(id);
    refresh();
    toast.success("Template deleted.");
  };

  const handleUseTemplate = (template) => {
    // Navigate to CreateBibleStudyPlan with template data pre-filled via query params
    const params = new URLSearchParams({
      title: template.title,
      description: template.description || "",
      verses: (template.verses || []).join("\n"),
    });
    navigate(`/CreateBibleStudyPlan?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-primary" /> Study Plan Templates
        </h3>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {showForm ? "Cancel" : "New Template"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Template Title *</Label>
            <Input
              placeholder="e.g. 4-Week Psalms Deep Dive"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea
              placeholder="What is this study about?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="min-h-[60px] text-sm resize-none"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Scripture References <span className="text-muted-foreground">(one per line)</span></Label>
            <Textarea
              placeholder={"Psalm 1:1-6\nPsalm 23:1-6\nJohn 3:16"}
              value={form.verses}
              onChange={e => setForm(f => ({ ...f, verses: e.target.value }))}
              className="min-h-[80px] text-sm resize-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tags <span className="text-muted-foreground">(comma separated)</span></Label>
            <Input
              placeholder="e.g. psalms, worship, prayer"
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              className="h-8 text-sm"
            />
          </div>
          <Button size="sm" className="w-full" disabled={saving || !form.title.trim()} onClick={handleSave}>
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      )}

      {/* Template list */}
      {templates.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground py-2 text-center">No templates yet. Create one to reuse across groups.</p>
      )}

      <div className="space-y-2">
        {templates.map(t => (
          <div key={t.id} className="border rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            >
              <div>
                <p className="text-sm font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{(t.verses || []).length} references</p>
              </div>
              {expanded === t.id
                ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              }
            </button>

            {expanded === t.id && (
              <div className="px-4 pb-4 space-y-3 border-t bg-muted/20">
                {t.description && <p className="text-xs text-muted-foreground pt-3">{t.description}</p>}
                {t.verses?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Scriptures</p>
                    <div className="flex flex-wrap gap-1">
                      {t.verses.map((v, i) => (
                        <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{v}</span>
                      ))}
                    </div>
                  </div>
                )}
                {t.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {t.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => handleUseTemplate(t)}>
                    <Copy className="w-3 h-3" /> Use Template
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}