import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PostCard from "@/components/feed/PostCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Feed() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feed-posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 50),
    staleTime: 30_000,
  });

  const visiblePosts = (posts || []).filter(
    (p) => !(p.hidden_by || []).includes(user?.email)
  );

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["feed-posts"] });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Feed</h1>
          <p className="text-sm text-muted-foreground">Community stories and reflections</p>
        </div>
        {/* Desktop create button */}
        <Link to="/CreatePost" className="hidden sm:block">
          <Button size="sm" className="rounded-full gap-2 shadow-[0_2px_12px_hsl(var(--primary)/0.35)]">
            <PenLine className="w-4 h-4" />
            New Post
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
          <p className="text-lg font-medium text-foreground mb-2">No posts yet</p>
          <p className="text-sm text-muted-foreground mb-4">Be the first to share something</p>
          <Link to="/CreatePost">
            <Button className="rounded-full">Create a Post</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={refresh} onDelete={refresh} />
          ))}
        </div>
      )}

      {/* Mobile floating action button */}
      <Link
        to="/CreatePost"
        className={cn(
          "sm:hidden fixed bottom-24 right-5 z-40",
          "flex items-center justify-center w-14 h-14 rounded-full",
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
          "shadow-[0_4px_20px_hsl(var(--primary)/0.50),0_2px_8px_hsl(var(--foreground)/0.12)]",
          "transition-transform duration-200 active:scale-95"
        )}
        aria-label="Create new post"
      >
        <PenLine className="w-5 h-5" />
      </Link>
    </div>
  );
}