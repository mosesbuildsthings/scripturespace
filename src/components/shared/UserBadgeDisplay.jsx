import React from 'react';
import { Award, Zap, Users, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const BADGE_CONFIG = {
  scripture_scholar: {
    name: 'Scripture Scholar',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: '50+ posts'
  },
  prayer_warrior: {
    name: 'Prayer Warrior',
    icon: Zap,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: '25+ prayer participations'
  },
  community_leader: {
    name: 'Community Leader',
    icon: Users,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'Exceptional community impact'
  },
  bible_expert: {
    name: 'Bible Expert',
    icon: Award,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
    description: '250+ posts'
  }
};

export default function UserBadgeDisplay({ badges = [] }) {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {badges.map(badge => {
        const config = BADGE_CONFIG[badge.badge_type];
        if (!config) return null;

        const Icon = config.icon;
        return (
          <div
            key={badge.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border',
              config.bgColor,
              config.borderColor
            )}
            title={config.description}
          >
            <Icon className={cn('w-4 h-4 shrink-0', config.color)} />
            <div className="flex-1">
              <p className={cn('text-xs font-semibold', config.color)}>
                {config.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {config.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}