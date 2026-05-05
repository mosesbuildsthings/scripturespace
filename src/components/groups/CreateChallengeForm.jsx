import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_BOOKS } from "@/components/bible/BibleBookSelector";

export default function CreateChallengeForm({ group, user, onCreated }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  const [readings, setReadings] = useState([{ book: "John", chapter: 1 }]);

  const addReading = () => setReadings([...readings, { book: "John", chapter: 1 }]);
  const removeReading = (i) => setReadings(readings.filter((_, idx) => idx !== i));
  const updateReading = (i, field, value) => {
    const updated = [...readings];
    updated[i] = { ...updated[i], [field]: field === "chapter" ? Number(value) : value };
    setReadings(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Challenge.create({
      group_id: group.id,
      group_name: group.name,
      title,
      description,
      created_by: user.email,
      creator_name: user.full_name,
      readings,
      end_date: endDate || undefined,
      participant_progress: [],
      is_active: true,
    });
    setTitle(""); setDescription(""); setEndDate(""); setReadings([{ book: "John", chapter: 1 }]);
    setSaving(false);
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-full text-xs gap-1">
          <Trophy className="w-3.5 h-3.5 text-amber-500" /> New Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create Reading Challenge</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-xs">Challenge Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 30-Day Psalms Challenge" className="mt-1" required />
          </div>
          <div>
            <Label className="text-xs">Description (optional)</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this challenge about?" className="mt-1 h-14 resize-none" />
          </div>
          <div>
            <Label className="text-xs">End Date (optional)</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Readings ({readings.length})</Label>
              <Button type="button" size="sm" variant="ghost" className="text-xs h-7 gap-1" onClick={addReading}>
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>
            {readings.map((r, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Select value={r.book} onValueChange={v => updateReading(i, "book", v)}>
                  <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-48">
                    {ALL_BOOKS.map(b => <SelectItem key={b.name} value={b.name} className="text-xs">{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} max={150} value={r.chapter} onChange={e => updateReading(i, "chapter", e.target.value)} className="w-16 h-8 text-xs text-center" />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeReading(i)} disabled={readings.length === 1}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="submit" disabled={saving || !title} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Challenge"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}