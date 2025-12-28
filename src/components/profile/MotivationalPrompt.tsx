import { Sparkles, TrendingUp, Heart, Zap } from 'lucide-react';

interface Props {
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    engagementScore: number;
  };
  streak: number;
}

export default function MotivationalPrompt({ stats, streak }: Props) {
  const getMotivationalMessage = () => {
    // Streak-based messages
    if (streak >= 30) {
      return {
        icon: Sparkles,
        message: "Incredible! You're on fire with a month-long streak! 🔥",
        color: 'from-orange-500 to-red-500',
      };
    }
    if (streak >= 7) {
      return {
        icon: TrendingUp,
        message: "Amazing! Keep that streak going! You're unstoppable! 💪",
        color: 'from-amber-500 to-orange-500',
      };
    }

    // Engagement-based messages
    if (stats.engagementScore >= 80) {
      return {
        icon: Zap,
        message: "You're a top contributor! Your stories inspire many! ⭐",
        color: 'from-yellow-500 to-amber-500',
      };
    }
    if (stats.totalLikes >= 100) {
      return {
        icon: Heart,
        message: `Your confessions helped ${stats.totalLikes}+ people relate! 💖`,
        color: 'from-pink-500 to-rose-500',
      };
    }

    // Post count-based messages
    if (stats.totalPosts >= 50) {
      return {
        icon: Sparkles,
        message: "Wow! Over 50 confessions shared. You're making a difference! ✨",
        color: 'from-purple-500 to-pink-500',
      };
    }
    if (stats.totalPosts >= 10) {
      return {
        icon: TrendingUp,
        message: "Great job! You're becoming a valued community member! 🌟",
        color: 'from-blue-500 to-purple-500',
      };
    }

    // Default encouraging message
    return {
      icon: Sparkles,
      message: "Keep sharing! Your story matters to the community! 💫",
      color: 'from-primary-500 to-accent-500',
    };
  };

  const motivation = getMotivationalMessage();
  const Icon = motivation.icon;

  return (
    <div
      className={`card bg-gradient-to-r ${motivation.color} bg-opacity-10 border-none overflow-hidden relative`}
    >
      <div className="absolute top-0 right-0 opacity-10">
        <Icon size={120} />
      </div>
      <div className="relative z-10 flex items-center gap-3">
        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full flex-shrink-0">
          <Icon className="text-white" size={24} />
        </div>
        <p className="text-white font-medium flex-1">{motivation.message}</p>
      </div>
    </div>
  );
}
