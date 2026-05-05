import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Crown, Users, BookOpen, Mic2, BarChart2, Lock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function LeaderDashboard() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const isLeader = user?.role === "admin" || user?.role === "leader" || user?.role === "pastor";

  const { data: groups = [] } = useQuery({
    queryKey: ["leader-groups", user?.email],
    queryFn: () => base44.entities.Group.filter({ leader_email: user.email }),
    enabled: !!user?.email && isLeader,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["leader-sessions"],
    queryFn: () => base44.entities.BibleStudySession.list("-created_date", 10),
    enabled: isLeader,
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ["leader-challenges", user?.email],
    queryFn: () => base44.entities.Challenge.filter({ created_by: user.email }),
    enabled: !!user?.email && isLeader,
  });

  if (!user) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  if (!isLeader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <Lock className="w-12 h-12 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold text-foreground">Leader Access Only</h2>
        <p className="text-sm text-muted-foreground max-w-sm">This dashboard is for pastors and group leaders. Contact an admin to request access.</p>
        <Link to="/Home"><Button variant="outline">Go Home</Button></Link>
      </div>
    );
  }

  const totalMembers = groups.reduce((sum, g) => sum + (g.members || []).length, 0);
  const liveSessions = sessions.filter(s => s.status === "live");
  const activeChallenges = challenges.filter(c => c.is_active);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Crown className="w-6 h-6 text-amber-500" />
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Leader Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user.full_name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "My Groups", value: groups.length, icon: Users, color: "text-primary" },
          { label: "Total Members", value: totalMembers, icon: Users, color: "text-blue-500" },
          { label: "Live Rooms", value: liveSessions.length, icon: Mic2, color: "text-red-500" },
          { label: "Challenges", value: activeChallenges.length, icon: BookOpen, color: "text-green-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Groups */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> My Groups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No groups yet.</p>
          ) : groups.map(g => (
            <div key={g.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
              <div>
                <p className="font-medium text-sm">{g.name}</p>
                <p className="text-xs text-muted-foreground">{(g.members || []).length} members · {g.category}</p>
              </div>
              <Link to="/Groups"><Button size="sm" variant="outline" className="rounded-full text-xs">Manage</Button></Link>
            </div>
          ))}
          <Link to="/Groups" className="block">
            <Button className="w-full mt-2 rounded-xl" variant="outline">+ Create New Group</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Active Challenges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeChallenges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active challenges.</p>
          ) : activeChallenges.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
              <div>
                <p className="font-medium text-sm">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.group_name} · {(c.participant_progress || []).length} participants</p>
              </div>
              {c.end_date && <Badge variant="outline" className="text-xs">{format(new Date(c.end_date), "MMM d")}</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Admin: Verification Requests */}
      {user?.role === "admin" && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" /> Verification Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/AdminVerifications">
              <Button className="w-full rounded-xl gap-2" variant="outline">
                Review Pending Requests
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Live Sessions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Mic2 className="w-4 h-4 text-primary" /> Audio Rooms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.slice(0, 5).map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
              <div>
                <p className="font-medium text-sm">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.creator_name}</p>
              </div>
              <Badge className={s.status === "live" ? "bg-red-500 text-white" : ""} variant={s.status !== "live" ? "secondary" : undefined}>
                {s.status}
              </Badge>
            </div>
          ))}
          <Link to="/BibleStudy" className="block">
            <Button className="w-full mt-2 rounded-xl" variant="outline">Manage Rooms</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}