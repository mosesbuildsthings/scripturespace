import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trophy, BookOpen, ChevronDown, ChevronUp, Check, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ChallengeCard from "@/components/groups/ChallengeCard";
import CreateChallengeForm from "@/components/groups/CreateChallengeForm";
import GroupAnnouncementsPanel from "@/components/groups/GroupAnnouncementsPanel";

const GROUP_CATEGORIES = ["church", "small_group", "youth", "womens", "mens", "bible_study", "prayer", "other"];

export default function Groups() {
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "small_group", is_public: true });
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: () => base44.entities.Group.list("-created_date", 50),
    staleTime: 30_000,
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => base44.entities.Challenge.list("-created_date", 100),
    staleTime: 30_000,
  });

  const refresh = () => { qc.invalidateQueries({ queryKey: ["groups"] }); qc.invalidateQueries({ queryKey: ["challenges"] }); };

  const myGroups = groups.filter(g => (g.members || []).includes(user?.email) || g.leader_email === user?.email);
  const otherGroups = groups.filter(g => !(g.members || []).includes(user?.email) && g.leader_email !== user?.email && g.is_public);

  const handleJoin = async (group) => {
    const members = [...(group.members || [])];
    if (!members.includes(user.email)) members.push(user.email);
    await base44.entities.Group.update(group.id, { members });
    refresh();
  };

  const handleLeave = async (group) => {
    const members = (group.members || []).filter(e => e !== user.email);
    await base44.entities.Group.update(group.id, { members });
    refresh();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    await base44.entities.Group.create({
      ...form,
      leader_email: user.email,
      leader_name: user.full_name,
      members: [user.email],
    });
    setForm({ name: "", description: "", category: "small_group", is_public: true });
    setShowCreate(false);
    setCreating(false);
    refresh();
  };

  const groupChallenges = (groupId) => challenges.filter(c => c.group_id === groupId && c.is_active);
  const isLeader = (group) => group.leader_email === user?.email;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Groups
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Join communities and take on reading challenges together.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} size="sm" className="rounded-full gap-1.5">
          <Plus className="w-4 h-4" /> Create
        </Button>
      </div>

      {/* Create Group Form */}
      {showCreate && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3"><CardTitle className="text-base">Create a Group</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div><Label className="text-xs">Group Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning Prayer Circle" className="mt-1" required />
              </div>
              <div><Label className="text-xs">Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is this group about?" className="mt-1 h-16 resize-none" />
              </div>
              <div><Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{GROUP_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={creating || !form.name} className="flex-1">{creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Group"}</Button>
                <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}><X className="w-4 h-4" /></Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Groups */}
      {myGroups.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-foreground text-sm text-muted-foreground uppercase tracking-wide">My Groups</h2>
          {myGroups.map(g => {
            const expanded = expandedGroup === g.id;
            const gc = groupChallenges(g.id);
            return (
              <Card key={g.id} className={cn("transition-all", expanded && "ring-1 ring-primary/30")}>
                <CardContent className="p-0">
                  <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpandedGroup(expanded ? null : g.id)}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{(g.members || []).length} members · {g.category?.replace("_", " ")}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {gc.length > 0 && <Badge className="bg-amber-100 text-amber-700 text-xs gap-1"><Trophy className="w-2.5 h-2.5" />{gc.length}</Badge>}
                      {isLeader(g) && <Badge variant="secondary" className="text-xs">Leader</Badge>}
                      {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4 space-y-4 border-t pt-4">
                      {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}

                      {/* Announcements Section */}
                      <div className="space-y-2">
                        <GroupAnnouncementsPanel group={g} user={user} isLeader={isLeader(g)} />
                      </div>

                      {/* Challenges Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-500" /> Reading Challenges</p>
                          {isLeader(g) && <CreateChallengeForm group={g} user={user} onCreated={refresh} />}
                        </div>
                        {gc.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">No active challenges. {isLeader(g) ? "Create one!" : ""}</p>
                        ) : gc.map(c => (
                          <ChallengeCard key={c.id} challenge={c} user={user} onUpdate={refresh} />
                        ))}
                      </div>

                      {/* Leave / Delete button */}
                      {!isLeader(g) && (
                        <Button size="sm" variant="destructive" className="w-full rounded-xl text-xs" onClick={() => handleLeave(g)}>Leave Group</Button>
                      )}
                      {isLeader(g) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full rounded-xl text-xs"
                          onClick={async () => {
                            if (!window.confirm("Delete this group permanently?")) return;
                            await base44.entities.Group.delete(g.id);
                            refresh();
                          }}
                        >
                          Delete Group
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      {/* Discover Groups */}
      {otherGroups.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Discover</h2>
          {otherGroups.map(g => (
            <Card key={g.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{g.name}</p>
                  <p className="text-xs text-muted-foreground">{g.leader_name} · {(g.members || []).length} members</p>
                  {g.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{g.description}</p>}
                </div>
                <Button size="sm" className="rounded-full text-xs shrink-0" onClick={() => handleJoin(g)}>Join</Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {!isLoading && groups.length === 0 && (
        <div className="text-center py-16 space-y-2">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No groups yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}