import React, { useState, useEffect, useRef } from "react";

// Module-level cache to avoid repeated User lookups per post render
const verifiedCache = {};
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, EyeOff, ExternalLink } from "lucide-react";
import LeaderBadge from "@/components/shared/LeaderBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import CommentSection from "./CommentSection";
import { parseScriptureText } from "@/components/shared/ScripturePopup";

export default function PostCard({ post, currentUser, onUpdate, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [authorVerified, setAuthorVerified] = useState(false);

  React.useEffect(() => {
    if (!post.author_email) return;
    if (verifiedCache[post.author_email] !== undefined) {
      setAuthorVerified(verifiedCache[post.author_email]);
      return;
    }
    base44.entities.User.filter({ email: post.author_email }).then(res => {
      const u = res[0];
      const isVerified = !!(u?.is_leader || ["leader", "pastor", "admin"].includes(u?.role));
      verifiedCache[post.author_email] = isVerified;
      setAuthorVerified(isVerified);
    });
  }, [post.author_email]);

  const likes = post.likes || [];
  const isLiked = likes.includes(currentUser?.email);
  const isOwner = post.author_email === currentUser?.email;

  const handleLike = async () => {
    if (isLiking) return;
    const newLikes = isLiked
      ? likes.filter((e) => e !== currentUser?.email)
      : [...likes, currentUser?.email];
    // Optimistic update
    setIsLiking(true);
    post.likes = newLikes; // Update UI immediately
    try {
      await base44.entities.Post.update(post.id, { likes: newLikes });
      onUpdate();
    } catch {
      post.likes = likes; // Revert on error
    }
    setIsLiking(false);
  };

  const handleDelete = async () => {
    await base44.entities.Post.delete(post.id);
    onUpdate();
  };

  const handleHide = async () => {
    const hiddenBy = post.hidden_by || [];
    await base44.entities.Post.update(post.id, {
      hidden_by: [...hiddenBy, currentUser?.email],
    });
    onUpdate();
  };

  const handleShare = async () => {
    // Share to own feed
    await base44.entities.Post.create({
      content: post.content,
      author_name: currentUser?.full_name || "User",
      author_email: currentUser?.email,
      image_url: post.image_url || "",
      verse_reference: post.verse_reference || "",
      is_shared: true,
      original_post_id: post.id,
      original_author_name: post.author_name,
      likes: [],
      hidden_by: [],
      comment_count: 0,
      share_count: 0,
    });
    await base44.entities.Post.update(post.id, {
      share_count: (post.share_count || 0) + 1,
    });
    onUpdate();
  };

  const handleExternalShare = () => {
    const text = `${post.content}${post.verse_reference ? `\n\n📖 ${post.verse_reference}` : ""}`;
    if (navigator.share) {
      navigator.share({ title: "BibleSocial Post", text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const timeAgo = post.created_date
    ? format(new Date(post.created_date), "MMM d 'at' h:mm a")
    : "";

  return (
    <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
      {/* Shared indicator */}
      {post.is_shared && (
        <div className="px-5 pt-3 pb-0">
          <p className="text-xs text-muted-foreground">
            <Share2 className="w-3 h-3 inline mr-1" />
            {post.author_name} shared {post.original_author_name}'s post
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-3">
        <Link to={`/UserProfile?email=${encodeURIComponent(post.author_email)}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">
            {(post.author_name || "U")[0].toUpperCase()}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground">{post.author_name || "Anonymous"}</p>
            {authorVerified && <LeaderBadge isLeader={true} size="xs" />}
          </div>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && (
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            )}
            {!isOwner && (
              <DropdownMenuItem onClick={handleHide}>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Post
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleExternalShare}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Share Externally
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="px-5 pb-3">
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{parseScriptureText(post.content)}</p>
        {post.verse_reference && (
          <span className="mt-2 inline-block">
            <span className="relative inline-block">
              {parseScriptureText(post.verse_reference)}
            </span>
          </span>
        )}
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="px-5 pb-3">
          <img
            src={post.image_url}
            alt="Post"
            loading="lazy"
            decoding="async"
            className="w-full rounded-xl object-cover max-h-96"
          />
        </div>
      )}

      {/* Stats */}
      <div className="px-5 py-2 flex items-center gap-4 text-xs text-muted-foreground border-t border-b">
        {likes.length > 0 && (
          <span>{likes.length} {likes.length === 1 ? "like" : "likes"}</span>
        )}
        {(post.comment_count || 0) > 0 && (
          <span>{post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}</span>
        )}
        {(post.share_count || 0) > 0 && (
          <span>{post.share_count} {post.share_count === 1 ? "share" : "shares"}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around px-2 py-1 select-none">
         <Button
           variant="ghost"
           size="sm"
           onClick={handleLike}
           className={cn(
             "flex-1 gap-2 text-sm select-none",
             isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"
           )}
         >
           <Heart className={cn("w-4 h-4 select-none pointer-events-none", isLiked && "fill-current")} />
           Like
         </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex-1 gap-2 text-sm text-muted-foreground select-none"
        >
          <MessageCircle className="w-4 h-4 select-none pointer-events-none" />
          Comment
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="flex-1 gap-2 text-sm text-muted-foreground select-none"
        >
          <Share2 className="w-4 h-4 select-none pointer-events-none" />
          Share
        </Button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection postId={post.id} currentUser={currentUser} onCommentAdded={onUpdate} />
      )}
    </div>
  );
}