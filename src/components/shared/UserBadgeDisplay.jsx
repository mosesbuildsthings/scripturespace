import React from 'react';
import { Award, Zap, Users, BookOpen, Flame, BookMarked, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

const BADGE_CONFIG = {
  scripture_scholar: {
    name: 'Scripture Scholar',
    emoji: '📖',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: '50+ posts shared'
  },
  prayer_warrior: {
    name: 'Prayer Warrior',
    emoji: '🙏',
    icon: Zap,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: '25+ prayer participations'
  },
  community_leader: {
    name: 'Community Leader',
    emoji: '👑',
    icon: Users,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'Exceptional community impact'
  },
  bible_expert: {
    name: 'Bible Expert',
    emoji: '📚',
    icon: Award,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
    description: '250+ posts or 3+ study plans completed'
  },
  faithful_reader: {
    name: 'Faithful Reader',
    emoji: '🏅',
    icon: BookMarked,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950',
    borderColor: 'border-sky-200 dark:border-sky-800',
    description: '7-day reading streak'
  },
  devoted_disciple: {
    name: 'Devoted Disciple',
    emoji: '🔥',
    icon: Flame,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    borderColor: 'border-orange-200 dark:border-orange-800',
    description: '30-day reading streak'
  },
  word_keeper: {
    name: 'Word Keeper',
    emoji: '✝️',
    icon: ScrollText,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: '100 total reading days'
  }
};

export default function UserBadgeDisplay({ badges = [] }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(badge => {
        const config = BADGE_CONFIG[badge.badge_type];
        if (!config) return null;
        return (
          <span
            key={badge.id}
            title={config.description}
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border cursor-default',
              config.bgColor,
              config.borderColor,
              config.color
            )}
          >
            <span>{config.emoji}</span>
            {config.name}
          </span>
        );
      })}
    </div>
  );
}