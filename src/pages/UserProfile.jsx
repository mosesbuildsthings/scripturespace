import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Camera, MapPin, Clock, Users, BookOpen, Loader2, X, Check, MessageSquare, Heart, History, Settings } from "lucide-react";
import { NativeSelect } from "@/components/ui/native-select";
import BackButton from "@/components/shared/BackButton";
import LeaderBadge from "@/components/shared/LeaderBadge";
import UserBadgeDisplay from "@/components/shared/UserBadgeDisplay";
import ProfileBadges from "@/components/profile/ProfileBadges";
import SendMessageDialog from "@/components/profile/SendMessageDialog";
import MyCollection from "@/components/profile/MyCollection";
import ReadingHistory from "@/components/profile/ReadingHistory";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";

const COUNTRIES = [
  "United States","United Kingdom","Canada","Australia","Nigeria","South Africa","Kenya","Ghana",
  "India","Philippines","Brazil","Mexico","Germany","France","Netherlands","New Zealand","Jamaica","Trinidad and Tobago","Other"
];

const TIMEZONES = [
  "America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
  "America/Toronto","Europe/London","Europe/Paris","Africa/Lagos","Africa/Nairobi",
  "Asia/Kolkata","Asia/Manila","Australia/Sydney","Pacific/Auckland"
];

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileUser, setProfileUser] = useState(null); // User entity for the viewed profile
  const [sessions, setSessions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [showBadges, setShowBadges] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [form, setForm] = useState({ country: "", timezone: "", bio: "", photos: [] });

  const [searchParams] = useSearchParams();
  const viewEmail = searchParams.get("email");

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.show_badges !== undefined) setShowBadges(u.show_badges);
      loadProfile(u, viewEmail || u?.email);
    });
  }, [viewEmail]);

  const loadProfile = async (currentUser, email) => {
    const results = await base44.entities.UserProfile.filter({ user_email: email });
    if (results[0]) {
      setProfile(results[0]);
      setForm({ country: results[0].country || "", timezone: results[0].timezone || "", bio: results[0].bio || "", photos: results[0].photos || [] });
    } else if (!viewEmail || viewEmail === currentUser?.email) {
      // Auto-create profile for current user
      const newProfile = await base44.entities.UserProfile.create({
        user_email: currentUser.email,
        user_name: currentUser.full_name || "User",
        photos: [], following: [], followers: []
      });
      setProfile(newProfile);
    }

    // Load User entity for badge
    const userRecords = await base44.entities.User.filter({ email });
    if (userRecords[0]) setProfileUser(userRecords[0]);

    // Load user achievement badges
    const userBadges = await base44.entities.UserBadge.filter({ user_email: email });
    setBadges(userBadges);

    const allSessions = await base44.entities.BibleStudySession.list("-created_date", 20);
    setSessions(allSessions.filter(s => (s.hosts || []).some(h => h.email === email) || (s.speakers || []).some(sp => sp.email === email)));
  };

  const saveProfile = async () => {
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, form);
    setProfile({ ...profile, ...form });
    setEditing(false);
    setSaving(false);
  };

  const handlePhotoUpload = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingIdx(idx);

    // Validate image type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      setUploadingIdx(null);
      return;
    }

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const newPhotos = [...(form.photos || [])];
    newPhotos[idx] = file_url;
    setForm(f => ({ ...f, photos: newPhotos }));
    setUploadingIdx(null);
  };

  const removePhoto = (idx) => {
    const newPhotos = [...(form.photos || [])];
    newPhotos[idx] = null;
    setForm(f => ({ ...f, photos: newPhotos.filter(Boolean) }));
  };

  const toggleFollow = async () => {
    if (!user || !profile) return;
    const myProfile = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (!myProfile[0]) return;

    const following = myProfile[0].following || [];
    const isFollowing = following.includes(profile.user_email);
    const updatedFollowing = isFollowing ? following.filter(e => e !== profile.user_email) : [...following, profile.user_email];
    await base44.entities.UserProfile.update(myProfile[0].id, { following: updatedFollowing });

    const theirFollowers = profile.followers || [];
    const updatedFollowers = isFollowing ? theirFollowers.filter(e => e !== user.email) : [...theirFollowers, user.email];
    await base44.entities.UserProfile.update(profile.id, { followers: updatedFollowers });
    setProfile({ ...profile, followers: updatedFollowers });
  };

  const localTime = () => {
    if (!profile?.timezone) return null;
    try {
      return new Date().toLocaleTimeString("en-US", { timeZone: profile.timezone, hour: "2-digit", minute: "2-digit" });
    } catch { return null; }
  };

  if (!profile) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const isOwn = !viewEmail || viewEmail === user?.email;
  const isFollowing = (profile.followers || []).includes(user?.email);
  const time = localTime();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <BackButton variant="ghost" />
        <h1 className="text-xl font-display font-bold flex-1">Profile</h1>
        {isOwn && !editing && (
          <div className="flex items-center gap-2">
            <Link to="/Settings">
              <Button size="sm" variant="ghost" className="rounded-full gap-1.5 text-xs text-muted-foreground">
                <Settings className="w-3.5 h-3.5" /> Settings
              </Button>
            </Link>
            <Button size="sm" variant="outline" className="rounded-full gap-2 text-xs" onClick={() => setEditing(true)}><Edit2 className="w-3 h-3" /> Edit</Button>
          </div>
        )}
        {isOwn && editing && (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" className="rounded-full text-xs gap-1" onClick={saveProfile} disabled={saving}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3" /> Save</>}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="bg-card rounded-2xl border p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary">{(profile.user_name || "U")[0].toUpperCase()}</span>
          </div>
          <div className="flex-1 space-y-3">
           <div className="flex items-center gap-2">
             <h2 className="text-lg font-bold text-foreground">{profile.user_name}</h2>
             <LeaderBadge user={profileUser || user} />
           </div>
           {profile.country && (
             <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.country}</p>
           )}
           {time && <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Local time: {time}</p>}
           <div className="flex items-center gap-3 text-sm text-muted-foreground">
             <span><strong className="text-foreground">{(profile.followers || []).length}</strong> followers</span>
             <span><strong className="text-foreground">{(profile.following || []).length}</strong> following</span>
           </div>
           {showBadges && badges.length > 0 && <UserBadgeDisplay badges={badges} />}
           {showBadges && (
             <ProfileBadges
               userEmail={viewEmail || user?.email}
               profile={profile}
               sessions={sessions}
             />
           )}
          </div>
          {!isOwn && (
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant={isFollowing ? "secondary" : "default"} className="rounded-full" onClick={toggleFollow}>
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button size="sm" variant="outline" className="rounded-full gap-1" onClick={() => setShowMessage(true)}>
                <MessageSquare className="w-3 h-3" /> Message
              </Button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-3 pt-2 border-t">
            <div className="space-y-1">
              <Label className="text-xs">Bio</Label>
              <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="A little about yourself..." className="min-h-[60px] text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Country</Label>
                <NativeSelect 
                  value={form.country} 
                  onChange={e => setForm(f => ({ ...f, country: e }))}
                  label="Select country"
                  className="text-sm"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </NativeSelect>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Timezone</Label>
                <NativeSelect 
                  value={form.timezone} 
                  onChange={e => setForm(f => ({ ...f, timezone: e }))}
                  label="Select timezone"
                  className="text-sm"
                >
                  <option value="">Select timezone</option>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </NativeSelect>
              </div>
            </div>
          </div>
        ) : (
          profile.bio && <p className="text-sm text-muted-foreground pt-2 border-t">{profile.bio}</p>
        )}
      </div>

      {/* Photos */}
      <div className="bg-card rounded-2xl border p-5 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Camera className="w-4 h-4" /> Photos</h3>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, idx) => {
            const photo = (editing ? form.photos : profile.photos || [])[idx];
            return (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                {photo ? (
                  <>
                    <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    {editing && (
                      <button onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </>
                ) : (
                  editing ? (
                    <label className="cursor-pointer flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e, idx)} />
                      {uploadingIdx === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                      <span className="text-[10px]">Add photo</span>
                    </label>
                  ) : (
                    <Camera className="w-5 h-5 text-muted-foreground/40" />
                  )
                )}
              </div>
            );
          })}
        </div>
        {isOwn && !editing && <p className="text-xs text-muted-foreground">Photos are reviewed for appropriate content. No nudity or vulgar images.</p>}
      </div>

      {/* Bible Study Sessions */}
      <div className="bg-card rounded-2xl border p-5 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4" /> Bible Study Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions yet.</p>
        ) : sessions.slice(0, 5).map(s => (
          <Link key={s.id} to={`/BibleStudyRoom?id=${s.id}`}>
            <div className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.scheduled_time ? format(new Date(s.scheduled_time), "MMM d, yyyy") : ""}</p>
              </div>
              <Badge variant={s.status === "live" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
            </div>
          </Link>
        ))}
      </div>

      {/* My Collection & History — only show on own profile */}
      {isOwn && (
        <div className="bg-card rounded-2xl border p-5">
          <Tabs defaultValue="collection">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="collection" className="flex-1 gap-1.5">
                <Heart className="w-3.5 h-3.5" /> My Collection
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 gap-1.5">
                <History className="w-3.5 h-3.5" /> History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="collection">
              <MyCollection userEmail={user?.email} />
            </TabsContent>
            <TabsContent value="history">
              <ReadingHistory userEmail={user?.email} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    <SendMessageDialog open={showMessage} onClose={() => setShowMessage(false)} toProfile={profile} currentUser={user} />
    </div>
  );
}