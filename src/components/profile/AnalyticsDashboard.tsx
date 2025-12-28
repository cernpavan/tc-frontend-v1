import { useState, useEffect } from 'react';
import { TrendingUp, Heart, MessageCircle, Zap, Clock } from 'lucide-react';
import { apiGet } from '@services/api';

interface AnalyticsStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalReactions: number;
  engagementScore: number;
}

interface AnalyticsData {
  stats: AnalyticsStats;
  bestPost: {
    id: string;
    title: string;
    upvotes: number;
    commentCount: number;
  } | null;
  activityGraph: Array<{ date: string; count: number }>;
  streak: number;
  achievements: string[];
  timeFilter: string;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';

interface Props {
  onFilterChange?: (filter: TimeFilter) => void;
}

export default function AnalyticsDashboard({ onFilterChange }: Props) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<AnalyticsData>(`/users/analytics?timeFilter=${timeFilter}`);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    onFilterChange?.(filter);
  };

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-32 bg-dark-700 rounded"></div>
      </div>
    );
  }

  if (!analytics) return null;

  const { stats, streak } = analytics;

  return (
    <div className="space-y-6">
      {/* Time Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(['today', 'week', 'month', 'all'] as TimeFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              timeFilter === filter
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-dark-300'
            }`}
          >
            {filter === 'today' && 'Today'}
            {filter === 'week' && 'This Week'}
            {filter === 'month' && 'This Month'}
            {filter === 'all' && 'All Time'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Posts */}
        <div className="card bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium mb-1">Posts</p>
              <p className="text-3xl font-bold text-white">
                {stats.totalPosts.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="text-purple-400" size={24} />
            </div>
          </div>
        </div>

        {/* Total Likes */}
        <div className="card bg-gradient-to-br from-pink-900/40 to-pink-800/20 border-pink-700/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-pink-400 text-sm font-medium mb-1">Likes</p>
              <p className="text-3xl font-bold text-white">
                {stats.totalLikes.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Heart className="text-pink-400" size={24} />
            </div>
          </div>
        </div>

        {/* Total Comments */}
        <div className="card bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium mb-1">Comments</p>
              <p className="text-3xl font-bold text-white">
                {stats.totalComments.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MessageCircle className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        {/* Engagement Score */}
        <div className="card bg-gradient-to-br from-orange-900/40 to-orange-800/20 border-orange-700/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium mb-1">Score</p>
              <p className="text-3xl font-bold text-white">
                {stats.engagementScore}
                <span className="text-sm text-orange-400">/100</span>
              </p>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Zap className="text-orange-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Streak Counter */}
      {streak > 0 && (
        <div className="card bg-gradient-to-r from-amber-900/40 via-orange-900/40 to-red-900/40 border-amber-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 rounded-full">
                <Clock className="text-amber-400" size={28} />
              </div>
              <div>
                <p className="text-sm text-amber-400 font-medium">Posting Streak</p>
                <p className="text-2xl font-bold text-white">
                  {streak} {streak === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl">🔥</p>
              <p className="text-xs text-amber-400 mt-1">Keep it up!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
