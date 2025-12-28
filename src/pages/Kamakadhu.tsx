import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PlusCircle, Flame, Clock, Heart, TrendingUp } from 'lucide-react';
import { apiGet } from '@services/api';
import { Post } from '../types';
import PostCard from '@components/post/PostCard';
import { useAuthStore } from '@store/authStore';
import { transformPosts } from '@utils/postTransform';

type FilterType = 'trending' | 'latest' | 'relatable' | 'hot';

const filters = [
  { id: 'trending', icon: TrendingUp, label: 'Trending', labelTe: 'ట్రెండింగ్' },
  { id: 'latest', icon: Clock, label: 'Latest', labelTe: 'తాజావి' },
  { id: 'relatable', icon: Heart, label: 'Relatable', labelTe: 'సంబంధం' },
  { id: 'hot', icon: Flame, label: 'Hottest', labelTe: 'హాటెస్ట్' },
];

export default function Kamakadhu() {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const isTeluguLang = user?.language === 'telugu';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('trending');
  const [_page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchKamakadhuPosts();
  }, [filter]);

  const fetchKamakadhuPosts = async () => {
    try {
      setLoading(true);
      // Fetch curated/trending posts - using the main feed with special filters
      // In a real implementation, you'd have a dedicated API endpoint for Kamakadhu content
      const postsData = await apiGet<{ posts: any[]; pagination: any }>(
        `/feed/posts?filter=${filter === 'hot' ? 'trending' : filter}&page=1&limit=20`
      );

      // Transform backend posts to frontend format
      setPosts(transformPosts(postsData.posts));
      setHasMore(postsData.pagination.pages > 1);
      setPage(1);
    } catch (error: any) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      openAuthModal(() => navigate('/create'));
      return;
    }
    navigate('/create');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-0">
      {/* Kamakadhu Header - Special styling with flame theme */}
      <div
        className="rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br from-orange-900/30 to-red-900/20 border border-orange-500/30"
      >
        {/* Mobile: Stack layout, Desktop: Side by side */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="text-2xl sm:text-4xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full flex-shrink-0 bg-gradient-to-br from-orange-500/30 to-red-500/30"
            >
              <Flame className="text-orange-400" size={28} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {isTeluguLang ? 'కామకథలు' : 'Kamakadhu'}
              </h1>
              <p className="text-dark-300 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2">
                {isTeluguLang
                  ? 'హాట్ మరియు ట్రెండింగ్ కన్ఫెషన్లు. అత్యంత ఆసక్తికరమైన కథలు.'
                  : 'Hot and trending confessions. The most interesting stories curated for you.'}
              </p>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-dark-400">
                <span className="flex items-center gap-1 text-orange-400">
                  <Flame size={14} />
                  {isTeluguLang ? 'క్యూరేటెడ్ కంటెంట్' : 'Curated Content'}
                </span>
              </div>
            </div>
          </div>
          {/* Create Post Button - Full width on mobile */}
          <button
            onClick={handleCreatePost}
            className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:from-orange-600 hover:to-red-600 transition-all"
          >
            <PlusCircle size={18} />
            <span className="text-sm sm:text-base">
              {isTeluguLang ? 'కన్ఫెస్ చేయండి' : 'Confess Now'}
            </span>
          </button>
        </div>
      </div>

      {/* Filters - Horizontal scrollable on mobile, wrap on larger screens */}
      <div className="bg-dark-900 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap scrollbar-hide -mx-1 px-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as FilterType)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg whitespace-nowrap transition-colors min-h-[44px] text-sm sm:text-base flex-shrink-0 sm:flex-shrink ${
                filter === f.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
            >
              <f.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span>{isTeluguLang ? f.labelTe : f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="animate-spin text-orange-400" size={32} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-dark-900 rounded-xl px-4">
            <Flame className="mx-auto mb-4 text-orange-400" size={48} />
            <p className="text-dark-400 mb-4 text-sm sm:text-base">
              {isTeluguLang
                ? 'ఇంకా హాట్ కన్ఫెషన్లు లేవు'
                : 'No hot confessions yet'}
            </p>
            <button
              onClick={handleCreatePost}
              className="min-h-[44px] text-sm sm:text-base px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:from-orange-600 hover:to-red-600 transition-all"
            >
              {isTeluguLang ? 'మొదటి పోస్ట్ చేయండి' : 'Be the first to post!'}
            </button>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>

      {/* Load More (if needed) */}
      {!loading && hasMore && posts.length > 0 && (
        <div className="text-center py-6">
          <button
            onClick={() => {
              // Load more implementation
            }}
            className="px-6 py-2 bg-dark-800 text-dark-300 rounded-lg hover:bg-dark-700 transition-colors"
          >
            {isTeluguLang ? 'మరిన్ని లోడ్ చేయండి' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
