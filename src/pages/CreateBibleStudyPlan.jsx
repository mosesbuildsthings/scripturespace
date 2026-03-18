import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, X, BookOpen, Loader2 } from "lucide-react";

export default function CreateBibleStudyPlan() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    verses: [],
    is_public: true,
    origin_scripture: "",
  });
  const [verseInput, setVerseInput] = useState("");

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Check if coming from scripture page
      const params = new URLSearchParams(window.location.search);
      const scripture = params.get("scripture");
      if (scripture) setForm(f => ({ ...f, origin_scripture: scripture, verses: [scripture] }));
    });
  }, []);

  const addVerse = () => {
    if (verseInput.trim()) {
      setForm(f => ({ ...f, verses: [...f.verses, verseInput.trim()] }));
      setVerseInput("");
    }
  };

  const removeVerse = (idx) => {
    setForm(f => ({ ...f, verses: f.verses.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await base44.entities.BibleStudyPlan.create({
      ...form,
      created_by: user?.email,
      creator_name: user?.full_name || "User",
      followers: [],
    });
    navigate("/BibleStudy");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/BibleStudy">
          <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <h1 className="text-xl font-display font-bold">Create Bible Study Plan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-card rounded-2xl border p-5">
        <div className="space-y-1">
          <Label>Plan Title *</Label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Journey Through Psalms" />
        </div>

        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What will this study cover?" className="min-h-[80px]" />
        </div>

        {form.origin_scripture && (
          <div className="bg-accent/30 rounded-xl p-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Created from daily scripture: <strong>{form.origin_scripture}</strong></span>
          </div>
        )}

        <div className="space-y-2">
          <Label>Bible Verses / Readings</Label>
          <div className="flex gap-2">
            <Input value={verseInput} onChange={e => setVerseInput(e.target.value)} placeholder="e.g. John 3:16" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addVerse())} />
            <Button type="button" variant="outline" onClick={addVerse}><Plus className="w-4 h-4" /></Button>
          </div>
          {form.verses.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.verses.map((v, i) => (
                <span key={i} className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1 text-xs">
                  📖 {v}
                  <button type="button" onClick={() => removeVerse(i)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between py-2 border-t">
          <div>
            <p className="text-sm font-medium">Make this plan public</p>
            <p className="text-xs text-muted-foreground">Others can discover and follow this plan</p>
          </div>
          <Switch checked={form.is_public} onCheckedChange={v => setForm(f => ({ ...f, is_public: v }))} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/BibleStudy")}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={saving || !form.title.trim()}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Plan"}
          </Button>
        </div>
      </form>
    </div>
  );
}