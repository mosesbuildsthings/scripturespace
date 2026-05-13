import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { HandHeart, Trash2, Bookmark, NotebookPen, ChevronDown, ChevronUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const CATEGORY_COLORS = {
  health: "bg-red-100 text-red-700",
  family: "bg-blue-100 text-blue-700",
  finances: "bg-yellow-100 text-yellow-700",
  guidance: "bg-purple-100 text-purple-700",
  gratitude: "bg-green-100 text-green-700",
  relationships: "bg-pink-100 text-pink-700",
  other: "bg-gray-100 text-gray-700",
};

export default function PrayerRequestCard({ request, currentUser, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(request.private_notes || "");
  const [notesSaving, setNotesSaving] = useState(false);

  const prayingUsers = request.praying_users || [];
  const bookmarkedBy = request.bookmarked_by || [];
  const isPraying = prayingUsers.includes(currentUser?.email);
  const isBookmarked = bookmarkedBy.includes(currentUser?.email);
  const isOwner = request.author_email === currentUser?.email;

  const handlePray = async () => {
    if (loading) return;
    const updated = isPraying
      ? prayingUsers.filter(e => e !== currentUser?.email)
      : [...prayingUsers, currentUser?.email];
    // Optimistic update
    setLoading(true);
    request.praying_users = updated;
    try {
      await base44.entities.PrayerRequest.update(request.id, { praying_users: updated });

      // Notify the prayer author when someone new starts praying (not the owner themselves)
      if (!isPraying && currentUser?.email !== request.author_email) {
        base44.functions.invoke("sendNotificationEmail", {
          type: "reply_to_prayer",
          payload: {
            prayer_id: request.id,
            commenter_name: currentUser?.full_name || "Someone",
            commenter_email: currentUser?.email,
            comment_content: `${currentUser?.full_name || "Someone"} is now praying for your request.`,
          },
        }).catch(() => {});
      }

      onUpdate();
    } catch {
      request.praying_users = prayingUsers; // Revert on error
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    await base44.entities.PrayerRequest.delete(request.id);
    onUpdate();
  };

  const handleBookmark = async () => {
    if (bookmarkLoading || !currentUser) return;
    setBookmarkLoading(true);
    const updated = isBookmarked
      ? bookmarkedBy.filter(e => e !== currentUser.email)
      : [...bookmarkedBy, currentUser.email];
    await base44.entities.PrayerRequest.update(request.id, { bookmarked_by: updated });
    onUpdate();
    setBookmarkLoading(false);
  };

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    await base44.entities.PrayerRequest.update(request.id, { private_notes: notes });
    onUpdate();
    setNotesSaving(false);
  };

  const authorLabel = request.is_anonymous ? "Anonymous" : (request.author_name || "Community Member");
  const timeAgo = request.created_date
    ? formatDistanceToNow(new Date(request.created_date), { addSuffix: true })
    : "";

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {request.is_anonymous ? "🙏" : (authorLabel[0] || "U").toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{authorLabel}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", CATEGORY_COLORS[request.category] || CATEGORY_COLORS.other)}>
            {request.category || "other"}
          </span>
          {isOwner && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {request.title && (
        <h3 className="text-base font-semibold text-foreground">{request.title}</h3>
      )}
      <p className="text-sm text-foreground/80 leading-relaxed">{request.content}</p>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t select-none">
        <p className="text-xs text-muted-foreground">
          {prayingUsers.length > 0
            ? `${prayingUsers.length} ${prayingUsers.length === 1 ? "person is" : "people are"} praying`
            : "Be the first to pray"}
        </p>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Button
              size="sm"
              variant="ghost"
              className={cn("rounded-full h-8 w-8 p-0 select-none", showNotes ? "text-primary" : "text-muted-foreground")}
              onClick={() => setShowNotes(v => !v)}
              title="Private notes — how did God answer this prayer?"
            >
              <NotebookPen className="w-3.5 h-3.5 pointer-events-none" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className={cn("rounded-full h-8 w-8 p-0 select-none", isBookmarked ? "text-primary" : "text-muted-foreground")}
            onClick={handleBookmark}
            disabled={bookmarkLoading || !currentUser}
            title={isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark className={cn("w-3.5 h-3.5 pointer-events-none", isBookmarked && "fill-current")} />
          </Button>
          <Button
            size="sm"
            variant={isPraying ? "default" : "outline"}
            className={cn("rounded-full gap-2 text-xs select-none", isPraying && "bg-primary")}
            onClick={handlePray}
            disabled={loading}
          >
            <HandHeart className="w-3.5 h-3.5 select-none pointer-events-none" />
            {isPraying ? "Praying 🙏" : "Pray"}
          </Button>
        </div>
      </div>

      {/* Private Notes (owner only) */}
      {isOwner && showNotes && (
        <div className="pt-2 border-t space-y-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <NotebookPen className="w-3 h-3 text-primary" /> How did God answer this prayer?
            <span className="font-normal">(private, only visible to you)</span>
          </p>
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Document how you saw God work through this request…"
            className="resize-none h-20 text-sm"
          />
          <Button size="sm" className="rounded-full gap-1.5 text-xs" onClick={handleSaveNotes} disabled={notesSaving}>
            <Save className="w-3 h-3" /> {notesSaving ? "Saving…" : "Save Note"}
          </Button>
        </div>
      )}
    </div>
  );
}