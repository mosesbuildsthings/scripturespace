import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CreatePostForm from "@/components/feed/CreatePostForm";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CreatePost() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/Feed">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-display font-bold text-foreground">Create Post</h1>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border p-5">
        <CreatePostForm currentUser={user} />
      </div>
    </div>
  );
}