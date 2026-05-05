import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2, Loader2, Share2, Pencil, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

const HIGHLIGHT_COLORS = [
  { name: "Yellow", hex: "#fef08a" },
  { name: "Green", hex: "#bbf7d0" },
  { name: "Blue", hex: "#bae6fd" },
  { name: "Pink", hex: "#fbcfe8" },
  { name: "Purple", hex: "#e9d5ff" },
];

export default function SavedVerses() {
  const [user, setUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [sharingId, setSharingId] = useState(null);
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: saved = [], isLoading } = useQuery({
    queryKey: ["saved-verses", user?.email],
    queryFn: () => base44.entities.SavedVerse.filter({ user_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
    staleTime: 30_000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["saved-verses", user?.email] });

  const handleDelete = async (id) => {
    await base44.entities.SavedVerse.delete(id);
    refresh();
    toast.success("Verse removed from collection.");
  };

  const handleSaveNote = async (id) => {
    await base44.entities.SavedVerse.update(id, { note: editNote });
    setEditingId(null);
    refresh();
  };

  const handleShare = async (verse) => {
    setSharingId(verse.id);
    const content = `"${verse.verse_text}" — ${verse.reference}${verse.note ? `\n\n💭 ${verse.note}` : ""}`;
    await base44.entities.Post.create({
      content,
      author_name: user?.full_name || "User",
      author_email: user?.email,
      verse_reference: verse.reference,
      likes: [],
      hidden_by: [],
      comment_count: 0,
      share_count: 0,
      is_shared: false,
    });
    setSharingId(null);
    toast.success("Shared to the Feed!");
  };

  const handleColorChange = async (id, hex) => {
    await base44.entities.SavedVerse.update(id, { highlight_color: hex });
    refresh();
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" /> Saved Verses
        </h2>
        <Badge variant="secondary">{saved.length} saved</Badge>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No saved verses yet.</p>
          <p className="text-xs text-muted-foreground">Tap a verse number while reading to highlight &amp; save it.</p>
        </div>
      ) : (
        saved.map(v => (
          <Card key={v.id} className="overflow-hidden">
            <div className="h-1.5 rounded-t-lg" style={{ backgroundColor: v.highlight_color || "#fef08a" }} />
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary">{v.reference}</p>
                  <p className="text-sm text-foreground/90 mt-1 leading-relaxed italic">"{v.verse_text}"</p>
                </div>
              </div>

              {/* Color picker */}
              <div className="flex gap-1.5">
                {HIGHLIGHT_COLORS.map(c => (
                  <button key={c.hex} onClick={() => handleColorChange(v.id, c.hex)}
                    className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c.hex, borderColor: v.highlight_color === c.hex ? "#374151" : "transparent" }}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Note */}
              {editingId === v.id ? (
                <div className="space-y-2">
                  <Textarea value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Add a personal note..." className="text-sm h-16 resize-none" autoFocus />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveNote(v.id)} className="gap-1"><Check className="w-3.5 h-3.5" /> Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ) : (
                <div>
                  {v.note ? (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">💭 {v.note}</p>
                  ) : null}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-1 border-t">
                <p className="text-[10px] text-muted-foreground">{v.translation} · {v.created_date ? format(new Date(v.created_date), "MMM d, yyyy") : ""}</p>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(v.id); setEditNote(v.note || ""); }} title="Add note">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" disabled={sharingId === v.id} onClick={() => handleShare(v)} title="Share to Feed">
                    {sharingId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => handleDelete(v.id)} title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}