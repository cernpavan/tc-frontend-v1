import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, PlusCircle, Users, Clock, Flame, Heart, MessageCircle } from 'lucide-react';
import { apiGet } from '@services/api';
import { Community, Post } from '../types';
import PostCard from '@components/post/PostCard';
import { useAuthStore } from '@store/authStore';
import { transformPosts } from '@utils/postTransform';

type FilterType = 'latest' | 'trending' | 'relatable' | 'commented';

const filters = [
  { id: 'latest', icon: Clock, label: 'Latest', labelTe: 'తాజావి' },
  { id: 'trending', icon: Flame, label: 'Trending', labelTe: 'ట్రెండింగ్' },
  { id: 'relatable', icon: Heart, label: 'Most Relatable', labelTe: 'చాలా సంబంధం' },
  { id: 'commented', icon: MessageCircle, label: 'Most Discussed', labelTe: 'ఎక్కువ చర్చ' },
];

export default function CommunityPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const isTeluguLang = user?.language === 'telugu';

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('latest');
  const [_page, setPage] = useState(1);
  const [_hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchCommunityAndPosts();
  }, [slug, filter]);

  const fetchCommunityAndPosts = async () => {
    try {
      setLoading(true);
      const [communityData, postsData] = await Promise.all([
        apiGet<{ community: Community }>(`/communities/${slug}`),
        apiGet<{ posts: any[]; pagination: any }>(`/communities/${slug}/posts?filter=${filter}&page=1`),
      ]);

      setCommunity(communityData.community);
      // Transform backend posts to frontend format
      setPosts(transformPosts(postsData.posts));
      setHasMore(postsData.pagination.pages > 1);
      setPage(1);
    } catch (error: any) {
      console.error('Failed to fetch community:', error);
      if (error.response?.status === 404) {
        navigate('/feed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/create', { state: { communityId: community?.id } });
  };

  if (loading || !community) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-0">
      {/* Community Header - Mobile Responsive */}
      <div
        className="rounded-xl p-4 sm:p-6 mb-4 sm:mb-6"
        style={{
          backgroundColor: community.color ? `${community.color}20` : '#1e293b',
          borderColor: community.color || '#334155',
          borderWidth: '1px',
        }}
      >
        {/* Mobile: Stack layout, Desktop: Side by side */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="text-2xl sm:text-4xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                backgroundColor: community.color ? `${community.color}30` : '#334155',
              }}
            >
              {community.icon || '💬'}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 truncate">
                {community.name}
              </h1>
              {community.description && (
                <p className="text-dark-300 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2">
                  {community.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs sm:text-sm text-dark-400">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {community.postCount} {isTeluguLang ? 'పోస్ట్‌లు' : 'posts'}
                </span>
              </div>
            </div>
          </div>
          {/* Create Post Button - Full width on mobile */}
          <button
            onClick={handleCreatePost}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
          >
            <PlusCircle size={18} />
            <span className="text-sm sm:text-base">
              {isTeluguLang ? 'పోస్ట్ చేయండి' : 'Create Post'}
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
                  ? 'bg-primary-600 text-white'
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
        {posts.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-dark-900 rounded-xl px-4">
            <p className="text-dark-400 mb-4 text-sm sm:text-base">
              {isTeluguLang
                ? 'ఈ కమ్యూనిటీలో పోస్ట్‌లు లేవు'
                : 'No posts in this community yet'}
            </p>
            <button
              onClick={handleCreatePost}
              className="btn-primary min-h-[44px] text-sm sm:text-base"
            >
              {isTeluguLang ? 'మొదటి పోస్ట్ చేయండి' : 'Be the first to post!'}
            </button>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
}
