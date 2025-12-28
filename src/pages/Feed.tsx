import { useState, memo, useMemo } from 'react';
import { useParams, useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Hash, TrendingUp, Clock, Heart, ArrowLeft, Plus, MessageSquare, Flame, PlusCircle, MessageCircle } from 'lucide-react';
import clsx from 'clsx';
import PostCard from '@components/post/PostCard';
import Pagination from '@components/common/Pagination';
import Footer from '@components/common/Footer';
import { usePagination } from '@hooks/usePagination';
import { Post } from '../types';
import { transformPosts } from '@utils/postTransform';
import { useAuthStore } from '@store/authStore';

// Content type for web - Confessions or Kamakathalu
type ContentType = 'confessions' | 'kamakathalu';

// Kamakathalu filter options
type KamakathaluFilter = 'trending' | 'latest' | 'relatable' | 'hot';

// Skeleton loading component with shimmer effect for better perceived performance
const PostSkeleton = memo(() => (
  <div className="card animate-fade-in">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-24 h-4 skeleton-shimmer rounded" />
      <div className="w-16 h-4 skeleton-shimmer rounded" />
    </div>
    <div className="w-3/4 h-5 skeleton-shimmer rounded mb-3" />
    <div className="flex gap-2 mb-3">
      <div className="w-20 h-6 skeleton-shimmer rounded-full" />
      <div className="w-16 h-6 skeleton-shimmer rounded-full" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="w-full h-4 skeleton-shimmer rounded" />
      <div className="w-full h-4 skeleton-shimmer rounded" />
      <div className="w-2/3 h-4 skeleton-shimmer rounded" />
    </div>
    <div className="pt-3 border-t border-dark-750 flex items-center gap-4">
      <div className="w-20 h-8 skeleton-shimmer rounded-full" />
      <div className="w-16 h-8 skeleton-shimmer rounded-full" />
      <div className="w-12 h-8 skeleton-shimmer rounded-full" />
    </div>
  </div>
));
PostSkeleton.displayName = 'PostSkeleton';

// Tag display information
const tagInfo: Record<string, { label: string; labelTe: string; description: string }> = {
  'sexual-confession': {
    label: 'Sexual Confession',
    labelTe: 'లైంగిక ఒప్పుకోలు',
    description: 'Intimate confessions and experiences',
  },
  'fantasy-kinks': {
    label: 'Fantasy / Kinks',
    labelTe: 'ఫాంటసీ',
    description: 'Fantasies and desires',
  },
  'relationship-affair': {
    label: 'Relationship',
    labelTe: 'సంబంధం',
    description: 'Relationship stories and experiences',
  },
  'guilt-regret': {
    label: 'Guilt / Regret',
    labelTe: 'అపరాధ భావం',
    description: 'Things you feel guilty about',
  },
  'cheating': {
    label: 'Cheating',
    labelTe: 'మోసం',
    description: 'Stories about infidelity',
  },
  'one-night-story': {
    label: 'One Night Story',
    labelTe: 'ఒక రాత్రి కథ',
    description: 'One-time encounters',
  },
  'adult-advice': {
    label: 'Adult Advice',
    labelTe: 'పెద్దల సలహా',
    description: 'Seeking or sharing advice',
  },
  'dark-thoughts': {
    label: 'Dark Thoughts',
    labelTe: 'చీకటి ఆలోచనలు',
    description: 'Deep and dark thoughts',
  },
  'curiosity-question': {
    label: 'Curiosity / Question',
    labelTe: 'ఆసక్తి / ప్రశ్న',
    description: 'Questions and curiosities',
  },
};

// Kamakathalu filter definitions
const kamakathaluFilters = [
  { id: 'trending', icon: TrendingUp, label: 'Trending', labelTe: 'ట్రెండింగ్' },
  { id: 'latest', icon: Clock, label: 'Latest', labelTe: 'తాజావి' },
  { id: 'relatable', icon: Heart, label: 'Relatable', labelTe: 'సంబంధం' },
  { id: 'hot', icon: Flame, label: 'Hottest', labelTe: 'హాటెస్ట్' },
];

export default function Feed() {
  const { filter, tagSlug } = useParams<{ filter?: string; tagSlug?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const tag = tagSlug || searchParams.get('tag');
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const currentLanguage = isAuthenticated ? user?.language : (localStorage.getItem('guest-language') || 'english');
  const isTeluguLang = currentLanguage === 'telugu';

  // Determine if we're on a tag page
  const isTagPage = Boolean(tag) || location.pathname.includes('/feed/tag/');
  const [tagSort, setTagSort] = useState<'latest' | 'trending' | 'top'>('latest');

  // Web-only: Content type toggle (Confessions vs Kamakathalu)
  // This state is only used on desktop (hidden on mobile via lg:hidden classes)
  const [contentType, setContentType] = useState<ContentType>('confessions');
  const [kamakathaluFilter, setKamakathaluFilter] = useState<KamakathaluFilter>('trending');

  // Build the feed endpoint
  // DEFAULT: /feed shows TRENDING content for better engagement
  // Latest is available via /feed/latest filter
  // For Kamakathalu mode (web-only), use dedicated Kamakathalu endpoint with tag filtering
  const feedEndpoint = useMemo(() => {
    // If Kamakathalu mode is active (web-only), use Kamakathalu community endpoint
    // This filters posts by Kamakathalu tags (sexual-confession, fantasy-kinks, etc.)
    if (contentType === 'kamakathalu' && !isTagPage) {
      return `/feed/kamakathalu?sort=${kamakathaluFilter}`;
    }

    if (tag) {
      return `/feed/tag/${tag}?sort=${tagSort}`;
    }
    switch (filter) {
      case 'latest':
        return '/feed/latest';
      case 'trending':
        return '/feed/trending';
      case 'relatable':
        return '/feed/most-relatable';
      case 'commented':
        return '/feed/most-commented';
      case 'night':
        return '/feed/night-mode';
      default:
        // Default feed shows trending content
        return '/feed';
    }
  }, [filter, tag, tagSort, contentType, kamakathaluFilter, isTagPage]);

  // Use pagination hook with preloading and stale-while-revalidate
  const {
    items: posts,
    pagination,
    currentPage,
    isLoading,
    isStale,
    error,
    goToPage,
    refresh,
  } = usePagination<Post>({
    endpoint: feedEndpoint,
    itemsPerPage: 15,
    transformData: transformPosts,
  });

  // Handle create post action
  const handleCreatePost = () => {
    if (!isAuthenticated) {
      openAuthModal(() => navigate('/create'));
      return;
    }
    navigate('/create');
  };

  const getTitle = (): string => {
    // If in Kamakathalu mode, don't show title (handled by Kamakathalu header)
    if (contentType === 'kamakathalu' && !isTagPage) {
      return '';
    }

    if (tag) {
      const info = tagInfo[tag];
      return info ? info.label : tag.replace(/-/g, ' ');
    }

    switch (filter) {
      case 'latest':
        return 'Latest Confessions';
      case 'trending':
        return 'Trending';
      case 'relatable':
        return 'Most Relatable';
      case 'commented':
        return 'Most Discussed';
      case 'night':
        return 'Night Mode';
      default:
        // Default is trending
        return 'Trending';
    }
  };

  // Tag page header component
  const TagPageHeader = () => {
    if (!tag) return null;
    const info = tagInfo[tag];

    return (
      <div className="card mb-6">
        {/* Back button */}
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-primary-400 mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Feed
        </Link>

        {/* Tag header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center">
            <Hash size={24} className="text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{info?.label || tag.replace(/-/g, ' ')}</h1>
            {info?.description && (
              <p className="text-dark-400 text-sm">{info.description}</p>
            )}
          </div>
        </div>

        {/* Sort tabs - Reddit style */}
        <div className="flex flex-wrap gap-2 mt-4 border-t border-dark-800 pt-4 overflow-x-hidden">
          <button
            onClick={() => setTagSort('latest')}
            className={clsx(
              'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0',
              tagSort === 'latest'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            )}
          >
            <Clock size={16} />
            New
          </button>
          <button
            onClick={() => setTagSort('trending')}
            className={clsx(
              'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0',
              tagSort === 'trending'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            )}
          >
            <TrendingUp size={16} />
            Hot
          </button>
          <button
            onClick={() => setTagSort('top')}
            className={clsx(
              'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0',
              tagSort === 'top'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            )}
          >
            <Heart size={16} />
            Top
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Web-only: Content Type Toggle (Confessions / Kamakathalu) - Hidden on mobile */}
      {!isTagPage && (
        <div className="hidden lg:block">
          <div className="bg-dark-900 rounded-xl p-1.5 inline-flex gap-1">
            <button
              onClick={() => setContentType('confessions')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                contentType === 'confessions'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800'
              )}
            >
              <MessageCircle size={18} />
              <span className={isTeluguLang ? 'font-telugu' : ''}>
                {isTeluguLang ? 'కన్ఫెషన్లు' : 'Confessions'}
              </span>
            </button>
            <button
              onClick={() => setContentType('kamakathalu')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                contentType === 'kamakathalu'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-dark-300 hover:text-orange-400 hover:bg-dark-800'
              )}
            >
              <Flame size={18} />
              <span className={isTeluguLang ? 'font-telugu' : ''}>
                {isTeluguLang ? 'కామకథలు' : 'Kamakathalu'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Tag Page Header (if on tag page) */}
      {isTagPage && tag && <TagPageHeader />}

      {/* Kamakathalu Header - Web only, shown when Kamakathalu tab is active */}
      {!isTagPage && contentType === 'kamakathalu' && (
        <div className="hidden lg:block">
          <div className="rounded-xl p-4 sm:p-6 mb-2 bg-gradient-to-br from-orange-900/30 to-red-900/20 border border-orange-500/30">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-2xl sm:text-4xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full flex-shrink-0 bg-gradient-to-br from-orange-500/30 to-red-500/30">
                  <Flame className="text-orange-400" size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className={clsx(
                    'text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent',
                    isTeluguLang && 'font-telugu'
                  )}>
                    {isTeluguLang ? 'కామకథలు' : 'Kamakathalu'}
                  </h1>
                  <p className={clsx(
                    'text-dark-300 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2',
                    isTeluguLang && 'font-telugu'
                  )}>
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
              {/* Create Post Button */}
              <button
                onClick={handleCreatePost}
                className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <PlusCircle size={18} />
                <span className={clsx('text-sm sm:text-base', isTeluguLang && 'font-telugu')}>
                  {isTeluguLang ? 'కన్ఫెస్ చేయండి' : 'Confess Now'}
                </span>
              </button>
            </div>
          </div>

          {/* Kamakathalu Filters */}
          <div className="bg-dark-900 rounded-xl p-3 sm:p-4">
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap scrollbar-hide -mx-1 px-1">
              {kamakathaluFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setKamakathaluFilter(f.id as KamakathaluFilter)}
                  className={clsx(
                    'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg whitespace-nowrap transition-colors min-h-[44px] text-sm sm:text-base flex-shrink-0 sm:flex-shrink',
                    kamakathaluFilter === f.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  )}
                >
                  <f.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className={isTeluguLang ? 'font-telugu' : ''}>
                    {isTeluguLang ? f.labelTe : f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Regular Header - Desktop (if not on tag page and in Confessions mode) */}
      {!isTagPage && contentType === 'confessions' && (
        <div className="hidden lg:flex items-center justify-between">
          <h1 className="text-2xl font-bold">{getTitle()}</h1>
          {filter === 'night' && (
            <span className="badge-primary">
              10 PM - 2 AM Special
            </span>
          )}
        </div>
      )}

      {/* Mobile: Regular Header (always show, since toggle is hidden on mobile) */}
      {!isTagPage && (
        <div className="lg:hidden flex items-center justify-between">
          <h1 className="text-2xl font-bold">{getTitle() || 'Trending'}</h1>
          {filter === 'night' && (
            <span className="badge-primary">
              10 PM - 2 AM Special
            </span>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-900/20 border-red-700/50 text-red-300 text-center py-8">
          <p>{error}</p>
          <button
            onClick={refresh}
            className="btn-secondary mt-4"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State - Show skeletons only when no stale data available */}
      {isLoading && posts.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Posts List - Shows immediately with stale data, updates when fresh data arrives */}
      {posts.length > 0 && (
        <div className={clsx(
          'space-y-4',
          isStale && 'opacity-70 transition-opacity duration-200'
        )}>
          {/* Stale data indicator - subtle loading bar at top */}
          {isStale && (
            <div className="h-0.5 bg-dark-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 animate-pulse w-full" />
            </div>
          )}
          {posts.map((post, index) => (
            <div
              key={post._id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={goToPage}
          isLoading={isLoading}
        />
      )}

      {/* Empty State */}
      {!isLoading && posts.length === 0 && !error && (
        <div className={clsx(
          'card text-center py-16 animate-fade-in',
          contentType === 'kamakathalu' && 'bg-dark-900'
        )}>
          <div className={clsx(
            'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center',
            contentType === 'kamakathalu' ? 'bg-orange-900/30' : 'bg-dark-800'
          )}>
            {contentType === 'kamakathalu' ? (
              <Flame size={32} className="text-orange-400" />
            ) : (
              <MessageSquare size={32} className="text-dark-500" />
            )}
          </div>
          <h3 className={clsx(
            'text-xl font-semibold text-dark-200 mb-2',
            isTeluguLang && 'font-telugu'
          )}>
            {contentType === 'kamakathalu'
              ? (isTeluguLang ? 'ఇంకా హాట్ కన్ఫెషన్లు లేవు' : 'No hot confessions yet')
              : (isTeluguLang ? 'ఇంకా కన్ఫెషన్లు లేవు' : 'No confessions yet')}
          </h3>
          <p className={clsx(
            'text-dark-400 mb-6 max-w-sm mx-auto',
            isTeluguLang && 'font-telugu'
          )}>
            {isTeluguLang
              ? 'మొదటి వ్యక్తిగా మీ కథను పంచుకోండి'
              : 'Be the first to share your story with the community'}
          </p>
          {contentType === 'kamakathalu' ? (
            <button
              onClick={handleCreatePost}
              className="min-h-[44px] text-sm sm:text-base px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:from-orange-600 hover:to-red-600 transition-all inline-flex items-center gap-2"
            >
              <PlusCircle size={18} />
              {isTeluguLang ? 'మొదటి పోస్ట్ చేయండి' : 'Be the first to post!'}
            </button>
          ) : (
            <Link to="/create" className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} />
              {isTeluguLang ? 'కన్ఫెస్ చేయండి' : 'Write a Confession'}
            </Link>
          )}
        </div>
      )}

      {/* Footer - show after posts */}
      {!isLoading && posts.length > 0 && <Footer />}
    </div>
  );
}
