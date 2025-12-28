import { Trophy, Star, Flame, Heart, MessageCircle, TrendingUp, Award } from 'lucide-react';

interface Achievement {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const achievementData: Record<string, Achievement> = {
  'first-post': {
    id: 'first-post',
    icon: Star,
    title: 'First Steps',
    description: 'Posted your first confession',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  '10-posts': {
    id: '10-posts',
    icon: TrendingUp,
    title: 'Getting Started',
    description: 'Posted 10 confessions',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  '50-posts': {
    id: '50-posts',
    icon: Award,
    title: 'Dedicated Confessor',
    description: 'Posted 50 confessions',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  '100-likes': {
    id: '100-likes',
    icon: Heart,
    title: 'Community Favorite',
    description: 'Received 100+ likes',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
  },
  '500-likes': {
    id: '500-likes',
    icon: Heart,
    title: 'Highly Relatable',
    description: 'Received 500+ likes',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
  },
  '50-comments': {
    id: '50-comments',
    icon: MessageCircle,
    title: 'Great Conversationalist',
    description: 'Received 50+ comments',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  'week-streak': {
    id: 'week-streak',
    icon: Flame,
    title: 'Weekly Warrior',
    description: '7-day posting streak',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  'month-streak': {
    id: 'month-streak',
    icon: Flame,
    title: 'Monthly Master',
    description: '30-day posting streak',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  'trending-author': {
    id: 'trending-author',
    icon: Trophy,
    title: 'Trending Author',
    description: 'Post reached 50+ upvotes',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
};

interface Props {
  achievements: string[];
}

export default function Achievements({ achievements }: Props) {
  if (achievements.length === 0) {
    return (
      <div className="card bg-dark-800/50 text-center py-8">
        <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy size={32} className="text-dark-500" />
        </div>
        <h3 className="text-lg font-semibold text-dark-400 mb-2">No Achievements Yet</h3>
        <p className="text-dark-500 text-sm">
          Keep posting and engaging to unlock achievements!
        </p>
      </div>
    );
  }

  return (
    <div className="card bg-dark-800/50">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-primary-400" size={20} />
        <h3 className="text-lg font-semibold">Achievements</h3>
        <span className="ml-auto text-sm text-dark-400">
          {achievements.length} earned
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {achievements.map((achievementId) => {
          const achievement = achievementData[achievementId];
          if (!achievement) return null;

          const Icon = achievement.icon;

          return (
            <div
              key={achievement.id}
              className="flex items-start gap-3 p-3 bg-dark-700/50 rounded-lg border border-dark-600 hover:border-primary-500/30 transition-all"
            >
              <div className={`p-2 ${achievement.bgColor} rounded-lg flex-shrink-0`}>
                <Icon className={achievement.color} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm mb-0.5">
                  {achievement.title}
                </h4>
                <p className="text-xs text-dark-400">{achievement.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
