import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function CommentSection({ postId, currentUser, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    const data = await base44.entities.Comment.filter({ post_id: postId }, "-created_date", 50);
    setComments(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);

    await base44.entities.Comment.create({
      post_id: postId,
      author_name: currentUser?.full_name || "User",
      author_email: currentUser?.email,
      content: newComment.trim(),
    });

    setNewComment("");
    setSubmitting(false);
    loadComments();
    onCommentAdded();
  };

  return (
    <div className="border-t px-5 py-4 space-y-3 bg-muted/30">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 text-sm rounded-full bg-background"
        />
        <Button
          type="submit"
          size="icon"
          disabled={submitting || !newComment.trim()}
          className="rounded-full h-10 w-10 shrink-0"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-2">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-primary">
                  {(comment.author_name || "U")[0].toUpperCase()}
                </span>
              </div>
              <div className="bg-background rounded-2xl px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-foreground">{comment.author_name}</p>
                <p className="text-sm text-foreground/90">{comment.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.created_date ? format(new Date(comment.created_date), "MMM d, h:mm a") : ""}
                </p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-2">No comments yet. Be the first!</p>
          )}
        </div>
      )}
    </div>
  );
}