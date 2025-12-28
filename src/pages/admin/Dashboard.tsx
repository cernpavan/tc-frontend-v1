import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Clock,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, DashboardStats, AdminPost } from '@services/adminApi';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  link?: string;
}

function StatCard({ title, value, icon, color, subtitle, link }: StatCardProps) {
  const content = (
    <div className={`bg-dark-900 border border-dark-800 rounded-xl p-6 hover:border-dark-700 transition-colors ${link ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-dark-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      {link && (
        <div className="mt-4 pt-4 border-t border-dark-800 flex items-center text-sm text-primary-400">
          View all <ArrowRight size={14} className="ml-1" />
        </div>
      )}
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<AdminPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const [dashboardData, liveData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getLiveStats(),
      ]);
      setStats(dashboardData);
      setRecentPosts(liveData.recentPosts || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">Overview of your platform</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-lg transition-colors"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          subtitle={`+${stats?.todayUsers || 0} today`}
          icon={<Users className="w-6 h-6 text-blue-400" />}
          color="bg-blue-500/20"
          link="/admin/users"
        />
        <StatCard
          title="Total Posts"
          value={stats?.totalPosts || 0}
          subtitle={`+${stats?.todayPosts || 0} today`}
          icon={<FileText className="w-6 h-6 text-green-400" />}
          color="bg-green-500/20"
          link="/admin/posts"
        />
        <StatCard
          title="Total Comments"
          value={stats?.totalComments || 0}
          icon={<MessageSquare className="w-6 h-6 text-purple-400" />}
          color="bg-purple-500/20"
        />
        <StatCard
          title="Pending Reports"
          value={stats?.pendingReports || 0}
          icon={<AlertTriangle className="w-6 h-6 text-amber-400" />}
          color="bg-amber-500/20"
          link="/admin/reports"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Activity */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">Today's Activity</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-dark-800">
              <span className="text-dark-400">New Users</span>
              <span className="text-white font-medium">{stats?.todayUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-dark-800">
              <span className="text-dark-400">New Posts</span>
              <span className="text-white font-medium">{stats?.todayPosts || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-dark-400">Pending Reports</span>
              <span className="text-amber-400 font-medium">{stats?.pendingReports || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">Recent Posts</h2>
            </div>
            <Link to="/admin/posts" className="text-sm text-primary-400 hover:text-primary-300">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentPosts.length === 0 ? (
              <p className="text-dark-500 text-sm text-center py-4">No recent posts</p>
            ) : (
              recentPosts.slice(0, 5).map((post) => (
                <div
                  key={post._id}
                  className="flex items-start gap-3 p-3 bg-dark-800/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-dark-500">
                        by {post.author?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-dark-600">|</span>
                      <span className="text-xs text-dark-500">
                        {new Date(post.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.nsfwLevel === 'extreme'
                        ? 'bg-red-500/20 text-red-400'
                        : post.nsfwLevel === 'explicit'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {post.nsfwLevel}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/posts"
            className="flex flex-col items-center gap-2 p-4 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <FileText className="w-6 h-6 text-blue-400" />
            <span className="text-sm text-dark-300">Moderate Posts</span>
          </Link>
          <Link
            to="/admin/reports"
            className="flex flex-col items-center gap-2 p-4 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span className="text-sm text-dark-300">Review Reports</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex flex-col items-center gap-2 p-4 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <Users className="w-6 h-6 text-green-400" />
            <span className="text-sm text-dark-300">Manage Users</span>
          </Link>
          <Link
            to="/admin/sub-admins"
            className="flex flex-col items-center gap-2 p-4 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <Users className="w-6 h-6 text-purple-400" />
            <span className="text-sm text-dark-300">Sub-Admins</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
