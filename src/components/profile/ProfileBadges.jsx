import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Flame, Users, MessageSquare, Heart, Star, Mic2, Zap, Trophy, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Badge definitions ────────────────────────────────────────────────────────
// Each badge has: id, label, emoji, icon, color classes, tooltip description,
// and a check(stats) function that returns true when earned.
const BADGE_DEFS = [
  {
    id: "consistent_reader",
    label: "Consistent Reader",
    emoji: "📅",
    icon: Zap,
    color: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800",
    desc: "Maintained a 7-day reading streak",
    check: ({ streak }) => streak >= 7,
  },
  {
    id: "scripture_scholar",
    label: "Scripture Scholar",
    emoji: "📖",
    icon: ScrollText,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800",
    desc: "Read 50+ chapters of the Bible",
    check: ({ readingCount }) => readingCount >= 50,
  },
  {
    id: "scripture_reader",
    label: "Scripture Reader",
    emoji: "📚",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    desc: "Read 10+ chapters of the Bible",
    check: ({ readingCount, streak }) => readingCount >= 10 && readingCount < 50,
  },
  {
    id: "prayer_warrior",
    label: "Prayer Warrior",
    emoji: "🙏",
    icon: Heart,
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
    desc: "Posted 5+ prayer requests",
    check: ({ prayerCount }) => prayerCount >= 5,
  },
  {
    id: "intercessor",
    label: "Intercessor",
    emoji: "✝️",
    icon: Heart,
    color: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800",
    desc: "Prayed for 10+ community requests",
    check: ({ prayingForCount }) => prayingForCount >= 10,
  },
  {
    id: "encourager",
    label: "Encourager",
    emoji: "💬",
    icon: MessageSquare,
    color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
    desc: "Left 10+ comments in the community",
    check: ({ commentCount }) => commentCount >= 10,
  },
  {
    id: "community_pillar",
    label: "Community Pillar",
    emoji: "🏛️",
    icon: Users,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    desc: "Has 5+ followers",
    check: ({ followersCount }) => followersCount >= 5,
  },
  {
    id: "on_fire",
    label: "On Fire",
    emoji: "🔥",
    icon: Flame,
    color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
    desc: "Posted 10+ times in the feed",
    check: ({ postCount }) => postCount >= 10,
  },
  {
    id: "room_host",
    label: "Room Host",
    emoji: "🎙️",
    icon: Mic2,
    color: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800",
    desc: "Hosted a Bible study room",
    check: ({ sessionCount }) => sessionCount >= 1,
  },
  {
    id: "top_contributor",
    label: "Top Contributor",
    emoji: "🏆",
    icon: Trophy,
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    desc: "Posted 25+ times and has 10+ followers",
    check: ({ postCount, followersCount }) => postCount >= 25 && followersCount >= 10,
  },
  {
    id: "early_adopter",
    label: "Early Adopter",
    emoji: "⭐",
    icon: Star,
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800",
    desc: "One of the first to join the community",
    check: ({ joinedDaysAgo }) => joinedDaysAgo <= 30,
  },
];

// ── Streak calculation ────────────────────────────────────────────────────────
function computeStreak(readings) {
  if (!readings.length) return 0;
  const days = [...new Set(readings.map(r => r.read_date).filter(Boolean))].sort().reverse();
  if (!days.length) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Streak must include today or yesterday to still be active
  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = Math.round((prev - curr) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProfileBadges({ userEmail, profile, sessions = [] }) {
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    computeBadges();
  }, [userEmail]);

  const computeBadges = async () => {
    setLoading(true);
    const [readings, posts, prayers, allPrayers, comments] = await Promise.all([
      base44.entities.BibleProgress.filter({ user_email: userEmail }),
      base44.entities.Post.filter({ author_email: userEmail }),
      base44.entities.PrayerRequest.filter({ author_email: userEmail }),
      base44.entities.PrayerRequest.list("-created_date", 200),
      base44.entities.Comment.filter({ author_email: userEmail }),
    ]);

    const currentStreak = computeStreak(readings);
    setStreak(currentStreak);

    // How many community prayer requests this user has "prayed for"
    const prayingForCount = allPrayers.filter(
      p => (p.praying_users || []).includes(userEmail)
    ).length;

    const followersCount = (profile?.followers || []).length;
    const sessionCount = sessions.filter(
      s => (s.hosts || []).some(h => h.email === userEmail)
    ).length;

    const allDates = posts.map(p => p.created_date).filter(Boolean);
    const earliest = allDates.length
      ? new Date(Math.min(...allDates.map(d => new Date(d))))
      : new Date();
    const joinedDaysAgo = Math.floor((Date.now() - earliest) / (1000 * 60 * 60 * 24));

    const stats = {
      readingCount: readings.length,
      streak: currentStreak,
      postCount: posts.length,
      followersCount,
      prayerCount: prayers.length,
      prayingForCount,
      commentCount: comments.length,
      sessionCount,
      joinedDaysAgo,
    };

    setBadges(BADGE_DEFS.filter(b => b.check(stats)));
    setLoading(false);
  };

  if (loading || (badges.length === 0 && streak === 0)) return null;

  return (
    <div className="space-y-1.5">
      {/* Streak pill — always shown if active */}
      {streak >= 3 && (
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800">
            🔥 {streak}-day streak
          </span>
        </div>
      )}

      {/* Badge pills */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.map(badge => (
            <span
              key={badge.id}
              title={badge.desc}
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border cursor-default",
                badge.color
              )}
            >
              <span>{badge.emoji}</span>
              {badge.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}