import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, BookOpen, Users, Globe, Lock, Search, Calendar, Radio } from "lucide-react";
import { format } from "date-fns";

export default function BibleStudy() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: plans = [] } = useQuery({
    queryKey: ["bible-study-plans"],
    queryFn: () => base44.entities.BibleStudyPlan.list("-created_date", 50),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["bible-study-sessions"],
    queryFn: () => base44.entities.BibleStudySession.list("-scheduled_time", 50),
  });

  const myPlans = plans.filter(p => p.created_by === user?.email);
  const followedPlans = plans.filter(p => (p.followers || []).includes(user?.email));
  const publicPlans = plans.filter(p => p.is_public && p.created_by !== user?.email);
  const filteredPublic = publicPlans.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const upcomingSessions = sessions.filter(s => s.status === "live" || s.status === "scheduled");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Bible Study</h1>
          <p className="text-sm text-muted-foreground">Plans, sessions & live rooms</p>
        </div>
        <Link to="/CreateBibleStudyPlan">
          <Button size="sm" className="rounded-full gap-2">
            <Plus className="w-4 h-4" /> New Plan
          </Button>
        </Link>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Upcoming & Live Sessions</h2>
          {upcomingSessions.map(session => (
            <SessionCard key={session.id} session={session} user={user} />
          ))}
        </div>
      )}

      <Tabs defaultValue="my">
        <TabsList className="w-full">
          <TabsTrigger value="my" className="flex-1">My Plans</TabsTrigger>
          <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
          <TabsTrigger value="discover" className="flex-1">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-3 mt-4">
          {myPlans.length === 0 ? (
            <EmptyState text="You haven't created any Bible study plans yet." action={<Link to="/CreateBibleStudyPlan"><Button variant="outline" size="sm">Create a Plan</Button></Link>} />
          ) : myPlans.map(plan => <PlanCard key={plan.id} plan={plan} user={user} />)}
        </TabsContent>

        <TabsContent value="following" className="space-y-3 mt-4">
          {followedPlans.length === 0 ? (
            <EmptyState text="You're not following any Bible study plans yet." action={null} />
          ) : followedPlans.map(plan => <PlanCard key={plan.id} plan={plan} user={user} />)}
        </TabsContent>

        <TabsContent value="discover" className="space-y-3 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plans..." className="pl-9" />
          </div>
          {filteredPublic.length === 0 ? (
            <EmptyState text="No public Bible study plans found." action={null} />
          ) : filteredPublic.map(plan => <PlanCard key={plan.id} plan={plan} user={user} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlanCard({ plan, user }) {
  const queryClient = useQueryClient();
  const isFollowing = (plan.followers || []).includes(user?.email);
  const isOwner = plan.created_by === user?.email;

  const toggleFollow = async (e) => {
    e.preventDefault();
    const followers = plan.followers || [];
    const updated = isFollowing ? followers.filter(f => f !== user?.email) : [...followers, user?.email];
    await base44.entities.BibleStudyPlan.update(plan.id, { followers: updated });
    queryClient.invalidateQueries({ queryKey: ["bible-study-plans"] });
  };

  return (
    <Link to={`/BibleStudyPlanDetail?id=${plan.id}`}>
      <div className="bg-card rounded-2xl border p-4 hover:shadow-md transition-shadow space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{plan.title}</h3>
              {plan.is_public ? <Globe className="w-3 h-3 text-muted-foreground" /> : <Lock className="w-3 h-3 text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
            <p className="text-xs text-muted-foreground mt-1">by {plan.creator_name || "Unknown"} · {(plan.followers || []).length} followers</p>
          </div>
          {!isOwner && (
            <Button size="sm" variant={isFollowing ? "secondary" : "default"} className="shrink-0 rounded-full text-xs" onClick={toggleFollow}>
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
        {plan.origin_scripture && (
          <Badge variant="secondary" className="text-xs">📖 From: {plan.origin_scripture}</Badge>
        )}
      </div>
    </Link>
  );
}

function SessionCard({ session, user }) {
  const isLive = session.status === "live";
  const scheduledDate = session.scheduled_time ? format(new Date(session.scheduled_time), "MMM d 'at' h:mm a") : "";

  return (
    <Link to={`/BibleStudyRoom?id=${session.id}`}>
      <div className={`rounded-2xl border p-4 transition-shadow hover:shadow-md ${isLive ? "bg-primary/5 border-primary/30" : "bg-card"}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isLive && <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><Radio className="w-3 h-3 animate-pulse" /> LIVE</span>}
              <h3 className="font-semibold text-foreground text-sm">{session.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1"><Calendar className="w-3 h-3 inline mr-1" />{scheduledDate}</p>
            <p className="text-xs text-muted-foreground">{(session.hosts || []).length} hosts · {(session.listeners || []).length} listeners</p>
          </div>
          <Button size="sm" variant={isLive ? "default" : "outline"} className="rounded-full text-xs shrink-0">
            {isLive ? "Join Live" : "View"}
          </Button>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ text, action }) {
  return (
    <div className="text-center py-10 bg-card rounded-2xl border">
      <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-3">{text}</p>
      {action}
    </div>
  );
}