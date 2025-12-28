import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, FileText } from 'lucide-react';
import PostCard from '@components/post/PostCard';
import AnalyticsDashboard from '@components/profile/AnalyticsDashboard';
import PostFilters, { PostFilterType } from '@components/profile/PostFilters';
import Achievements from '@components/profile/Achievements';
import ActivityGraph from '@components/profile/ActivityGraph';
import BestPost from '@components/profile/BestPost';
import MotivationalPrompt from '@components/profile/MotivationalPrompt';
import { apiGet } from '@services/api';
import { Post } from '../types';
import { transformPosts } from '@utils/postTransform';

interface AnalyticsData {
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalReactions: number;
    engagementScore: number;
  };
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

export default function MyPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postFilter, setPostFilter] = useState<PostFilterType>('latest');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [postsResponse, analyticsData] = await Promise.all([
          apiGet<{ posts: any[] }>('/posts/user/my-posts'),
          apiGet<AnalyticsData>('/users/analytics?timeFilter=all'),
        ]);

        // Transform backend posts to frontend format
        const transformedPosts = transformPosts(postsResponse.posts);
        setPosts(transformedPosts);
        setFilteredPosts(transformedPosts);
        setAnalytics(analyticsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load your posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter posts when filter changes
  useEffect(() => {
    if (!posts.length) return;

    let sorted = [...posts];

    switch (postFilter) {
      case 'most-liked':
        sorted.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'most-commented':
        sorted.sort((a, b) => b.commentCount - a.commentCount);
        break;
      case 'most-viewed':
        // For now, use upvotes as proxy for views
        sorted.sort((a, b) => (b.upvotes + b.commentCount) - (a.upvotes + a.commentCount));
        break;
      case 'latest':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredPosts(sorted);
  }, [postFilter, posts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary-400" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Link to="/create" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>New Post</span>
        </Link>
      </div>

      {error && (
        <div className="card bg-red-900/20 border-red-700/50 text-red-300 text-center py-8">
          <p>{error}</p>
        </div>
      )}

      {!error && posts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-dark-500" />
          </div>
          <h2 className="text-xl font-semibold text-dark-300 mb-2">
            No confessions yet
          </h2>
          <p className="text-dark-500 mb-6">
            Share your first story with the community
          </p>
          <Link to="/create" className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} />
            Create Your First Confession
          </Link>
        </div>
      ) : (
        <>
          {/* Analytics Dashboard */}
          {analytics && <AnalyticsDashboard />}

          {/* Motivational Prompt */}
          {analytics && (
            <MotivationalPrompt stats={analytics.stats} streak={analytics.streak} />
          )}

          {/* Best Post & Activity in Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics?.bestPost && <BestPost post={analytics.bestPost} />}
            {analytics?.activityGraph && <ActivityGraph data={analytics.activityGraph} />}
          </div>

          {/* Achievements */}
          {analytics?.achievements && <Achievements achievements={analytics.achievements} />}

          {/* Post Filters */}
          <PostFilters activeFilter={postFilter} onFilterChange={setPostFilter} />

          {/* Posts List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Your Confessions ({filteredPosts.length})
            </h2>
            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
