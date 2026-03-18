import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe, Lock, Users, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";

export default function BibleStudyPlanDetail() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const planId = params.get("id");

  useEffect(() => {
    base44.auth.me().then(setUser);
    if (planId) {
      base44.entities.BibleStudyPlan.filter({ id: planId }).then(r => setPlan(r[0]));
      base44.entities.BibleStudySession.filter({ plan_id: planId }).then(setSessions);
    }
  }, [planId]);

  if (!plan) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const isOwner = plan.created_by === user?.email;
  const isFollowing = (plan.followers || []).includes(user?.email);

  const toggleFollow = async () => {
    const followers = plan.followers || [];
    const updated = isFollowing ? followers.filter(f => f !== user?.email) : [...followers, user?.email];
    await base44.entities.BibleStudyPlan.update(plan.id, { followers: updated });
    setPlan({ ...plan, followers: updated });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/BibleStudy"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <h1 className="text-xl font-display font-bold flex-1 truncate">{plan.title}</h1>
      </div>

      <div className="bg-card rounded-2xl border p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {plan.is_public ? <Globe className="w-4 h-4 text-muted-foreground" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground">{plan.is_public ? "Public" : "Private"} · by {plan.creator_name}</span>
            </div>
            <p className="text-sm text-foreground">{plan.description}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" /> {(plan.followers || []).length} followers
            </div>
          </div>
          {!isOwner && (
            <Button size="sm" variant={isFollowing ? "secondary" : "default"} className="rounded-full" onClick={toggleFollow}>
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        {plan.origin_scripture && (
          <Badge variant="secondary">📖 Origin: {plan.origin_scripture}</Badge>
        )}

        {(plan.verses || []).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Readings</p>
            <div className="flex flex-wrap gap-2">
              {plan.verses.map((v, i) => <Badge key={i} variant="outline">📖 {v}</Badge>)}
            </div>
          </div>
        )}
      </div>

      {/* Sessions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Sessions</h2>
          {isOwner && (
            <Link to={`/ScheduleSession?planId=${plan.id}&planTitle=${encodeURIComponent(plan.title)}`}>
              <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs"><Plus className="w-3 h-3" /> Schedule</Button>
            </Link>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 bg-card rounded-2xl border">
            <Calendar className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No sessions scheduled yet.</p>
          </div>
        ) : sessions.map(session => (
          <Link key={session.id} to={`/BibleStudyRoom?id=${session.id}`}>
            <div className="bg-card rounded-xl border p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{session.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {session.scheduled_time ? format(new Date(session.scheduled_time), "EEE, MMM d 'at' h:mm a") : ""}
                  </p>
                </div>
                <Badge variant={session.status === "live" ? "default" : "secondary"}>
                  {session.status}
                </Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}