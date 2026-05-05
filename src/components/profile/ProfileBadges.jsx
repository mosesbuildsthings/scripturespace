import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Flame, Users, MessageSquare, Heart, Star, Mic2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const BADGE_DEFS = [
  {
    id: "scripture_reader",
    label: "Scripture Reader",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    check: ({ readingCount }) => readingCount >= 10,
  },
  {
    id: "devoted_reader",
    label: "Devoted Reader",
    icon: BookOpen,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800",
    check: ({ readingCount }) => readingCount >= 50,
  },
  {
    id: "on_fire",
    label: "On Fire 🔥",
    icon: Flame,
    color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
    check: ({ postCount }) => postCount >= 10,
  },
  {
    id: "community_pillar",
    label: "Community Pillar",
    icon: Users,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    check: ({ followersCount }) => followersCount >= 5,
  },
  {
    id: "prayer_warrior",
    label: "Prayer Warrior",
    icon: Heart,
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
    check: ({ prayerCount }) => prayerCount >= 3,
  },
  {
    id: "encourager",
    label: "Encourager",
    icon: MessageSquare,
    color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
    check: ({ commentCount }) => commentCount >= 10,
  },
  {
    id: "room_host",
    label: "Room Host",
    icon: Mic2,
    color: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800",
    check: ({ sessionCount }) => sessionCount >= 1,
  },
  {
    id: "early_adopter",
    label: "Early Adopter",
    icon: Star,
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    check: ({ joinedDaysAgo }) => joinedDaysAgo <= 30,
  },
];

export default function ProfileBadges({ userEmail, profile, sessions = [] }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    computeBadges();
  }, [userEmail]);

  const computeBadges = async () => {
    setLoading(true);
    const [readings, posts, prayers, comments] = await Promise.all([
      base44.entities.BibleProgress.filter({ user_email: userEmail }),
      base44.entities.Post.filter({ author_email: userEmail }),
      base44.entities.PrayerRequest.filter({ author_email: userEmail }),
      base44.entities.Comment.filter({ author_email: userEmail }),
    ]);

    const followersCount = (profile?.followers || []).length;
    const sessionCount = sessions.filter(
      s => (s.hosts || []).some(h => h.email === userEmail)
    ).length;

    // Figure out days since first post / profile creation
    const allDates = posts.map(p => p.created_date).filter(Boolean);
    const earliest = allDates.length
      ? new Date(Math.min(...allDates.map(d => new Date(d))))
      : new Date();
    const joinedDaysAgo = Math.floor((Date.now() - earliest) / (1000 * 60 * 60 * 24));

    const stats = {
      readingCount: readings.length,
      postCount: posts.length,
      followersCount,
      prayerCount: prayers.length,
      commentCount: comments.length,
      sessionCount,
      joinedDaysAgo,
    };

    const earned = BADGE_DEFS.filter(b => b.check(stats));
    setBadges(earned);
    setLoading(false);
  };

  if (loading || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(badge => (
        <span
          key={badge.id}
          className={cn(
            "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
            badge.color
          )}
          title={badge.label}
        >
          <badge.icon className="w-2.5 h-2.5 shrink-0" />
          {badge.label}
        </span>
      ))}
    </div>
  );
}