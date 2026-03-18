import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ScriptureCard from "@/components/scripture/ScriptureCard";
import CreatePostForm from "@/components/feed/CreatePostForm";
import PostCard from "@/components/feed/PostCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["home-posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 10),
    initialData: [],
  });

  const visiblePosts = posts.filter(
    (p) => !(p.hidden_by || []).includes(user?.email)
  );

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["home-posts"] });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Good {getGreeting()}, {user?.full_name?.split(" ")[0] || "Friend"} ✨
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          May today's word bring you peace and strength.
        </p>
      </div>

      {/* Today's Scripture */}
      <ScriptureCard />

      {/* Quick Post */}
      <CreatePostForm currentUser={user} onPostCreated={refresh} inline={false} />

      {/* Recent Posts */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Posts</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          visiblePosts.slice(0, 5).map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onUpdate={refresh} onDelete={refresh} />
          ))
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}