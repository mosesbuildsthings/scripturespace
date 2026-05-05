import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PostCard from "@/components/feed/PostCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Community Feed</h1>
          <p className="text-sm text-muted-foreground">See what the community is sharing</p>
        </div>
        <Link to="/CreatePost">
          <Button size="sm" className="rounded-full gap-2">
            <PlusCircle className="w-4 h-4" />
            New Post
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border">
          <p className="text-lg font-medium text-foreground mb-2">No posts yet</p>
          <p className="text-sm text-muted-foreground mb-4">Be the first to share something with the community</p>
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
    </div>
  );
}