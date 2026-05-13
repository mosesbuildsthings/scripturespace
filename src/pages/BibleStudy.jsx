import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, BookOpen, Users, Globe, Lock, Search, Calendar, Radio, Archive, ArchiveRestore } from "lucide-react";
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

  const myPlans = plans.filter(p => p.created_by === user?.email && !p.is_archived);
  const archivedPlans = plans.filter(p => p.created_by === user?.email && p.is_archived);
  const followedPlans = plans.filter(p => (p.followers || []).includes(user?.email) && !p.is_archived);
  const publicPlans = plans.filter(p => p.is_public && p.created_by !== user?.email && !p.is_archived);
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
          <TabsTrigger value="archive" className="flex-1 gap-1"><Archive className="w-3 h-3" />Archive</TabsTrigger>
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

        <TabsContent value="archive" className="space-y-3 mt-4">
          {archivedPlans.length === 0 ? (
            <EmptyState text="No completed plans yet. Archive a plan when you finish it to save your notes here." action={null} icon={<Archive className="w-8 h-8 text-muted-foreground mx-auto mb-2" />} />
          ) : archivedPlans.map(plan => <PlanCard key={plan.id} plan={plan} user={user} archived />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlanCard({ plan, user, archived = false }) {
  const queryClient = useQueryClient();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(plan.completion_notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const isFollowing = (plan.followers || []).includes(user?.email);
  const isOwner = plan.created_by === user?.email;

  const toggleFollow = async (e) => {
    e.preventDefault();
    const followers = plan.followers || [];
    const updated = isFollowing ? followers.filter(f => f !== user?.email) : [...followers, user?.email];
    await base44.entities.BibleStudyPlan.update(plan.id, { followers: updated });
    queryClient.invalidateQueries({ queryKey: ["bible-study-plans"] });
  };

  const toggleArchive = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await base44.entities.BibleStudyPlan.update(plan.id, {
      is_archived: !plan.is_archived,
      archived_date: !plan.is_archived ? new Date().toISOString().split("T")[0] : null,
    });
    queryClient.invalidateQueries({ queryKey: ["bible-study-plans"] });
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    await base44.entities.BibleStudyPlan.update(plan.id, { completion_notes: notes });
    queryClient.invalidateQueries({ queryKey: ["bible-study-plans"] });
    setSavingNotes(false);
    setShowNotes(false);
  };

  return (
    <div className="bg-card rounded-2xl border p-4 hover:shadow-md transition-shadow space-y-2">
      <Link to={`/BibleStudyPlanDetail?id=${plan.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">{plan.title}</h3>
              {archived && <Badge variant="secondary" className="text-xs gap-1"><Archive className="w-2.5 h-2.5" />Completed</Badge>}
              {!archived && (plan.is_public ? <Globe className="w-3 h-3 text-muted-foreground" /> : <Lock className="w-3 h-3 text-muted-foreground" />)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{plan.description}</p>
            <p className="text-xs text-muted-foreground mt-1">by {plan.creator_name || "Unknown"} · {(plan.followers || []).length} followers</p>
            {archived && plan.archived_date && (
              <p className="text-xs text-muted-foreground mt-0.5">Completed {plan.archived_date}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isOwner && (
              <Button
                size="sm" variant="ghost"
                className="rounded-full text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={toggleArchive}
                title={archived ? "Restore plan" : "Mark as completed"}
              >
                {archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
              </Button>
            )}
            {!isOwner && (
              <Button size="sm" variant={isFollowing ? "secondary" : "default"} className="rounded-full text-xs" onClick={toggleFollow}>
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
        {plan.origin_scripture && (
          <Badge variant="secondary" className="text-xs">📖 From: {plan.origin_scripture}</Badge>
        )}
      </Link>

      {/* Completion Notes (archive view only) */}
      {archived && isOwner && (
        <div className="border-t pt-2">
          {!showNotes ? (
            <button
              onClick={() => setShowNotes(true)}
              className="text-xs text-primary hover:underline"
            >
              {plan.completion_notes ? "✏️ Edit reflection notes" : "📝 Add reflection notes"}
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Write your reflections, insights, or what God taught you through this study..."
                className="w-full text-sm border rounded-lg p-2 bg-background resize-none h-20 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button size="sm" className="text-xs rounded-full" onClick={saveNotes} disabled={savingNotes}>
                  {savingNotes ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="ghost" className="text-xs rounded-full" onClick={() => setShowNotes(false)}>Cancel</Button>
              </div>
            </div>
          )}
          {!showNotes && plan.completion_notes && (
            <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">"{plan.completion_notes}"</p>
          )}
        </div>
      )}
    </div>
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

function EmptyState({ text, action, icon }) {
  return (
    <div className="text-center py-10 bg-card rounded-2xl border">
      {icon || <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />}
      <p className="text-sm text-muted-foreground mb-3">{text}</p>
      {action}
    </div>
  );
}