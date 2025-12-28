import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Loader2,
  ArrowLeft,
  Clock,
  TrendingUp,
  MessageCircle,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { apiGet } from '@services/api';
import { Post } from '../types';
import { transformPost } from '@utils/postTransform';
import { useSearchStore } from '@store/searchStore';
import { useAuthStore } from '@store/authStore';

// Extended post type with search-specific fields
interface SearchPost extends Post {
  snippet?: string;
  relevanceScore?: number;
}

// Sort options
type SortOption = 'relevance' | 'new' | 'top' | 'comments';

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'relevance', label: 'Relevance', icon: <Sparkles size={16} /> },
  { value: 'new', label: 'New', icon: <Clock size={16} /> },
  { value: 'top', label: 'Most Voted', icon: <TrendingUp size={16} /> },
  { value: 'comments', label: 'Most Comments', icon: <MessageCircle size={16} /> },
];

// Tag labels for display
const TAG_LABELS: Record<string, { en: string; te: string }> = {
  'sexual-confession': { en: 'Sexual Confession', te: 'లైంగిక ఒప్పుకోలు' },
  'fantasy-kinks': { en: 'Fantasy & Kinks', te: 'ఫాంటసీ' },
  'relationship-affair': { en: 'Relationship/Affair', te: 'సంబంధం' },
  'guilt-regret': { en: 'Guilt & Regret', te: 'అపరాధ భావం' },
  cheating: { en: 'Cheating', te: 'మోసం' },
  'one-night-story': { en: 'One Night Story', te: 'ఒక రాత్రి' },
  'adult-advice': { en: 'Adult Advice', te: 'సలహా' },
  'dark-thoughts': { en: 'Dark Thoughts', te: 'చీకటి ఆలోచనలు' },
  'curiosity-question': { en: 'Curiosity/Question', te: 'ఆసక్తి' },
};

// Mood emojis
const MOOD_EMOJIS: Record<string, string> = {
  horny: '🔥',
  lonely: '😔',
  guilty: '😣',
  curious: '🤔',
  happy: '😊',
};

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const sortParam = (searchParams.get('sort') as SortOption) || 'relevance';

  const { addRecentSearch } = useSearchStore();
  const { user, isAuthenticated } = useAuthStore();

  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentSort, setCurrentSort] = useState<SortOption>(sortParam);

  const { ref: loadMoreRef, inView } = useInView();

  const currentLanguage = isAuthenticated
    ? user?.language
    : localStorage.getItem('guest-language') || 'english';
  const isTeluguLang = currentLanguage === 'telugu';

  const fetchSearchResults = async (pageNum: number, reset: boolean = false) => {
    if (!query.trim() || query.trim().length < 2) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const endpoint = `/feed/search?q=${encodeURIComponent(query)}&sort=${currentSort}&page=${pageNum}&limit=20`;

      const response = await apiGet<{
        posts: any[];
        query: string;
        sort: string;
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(endpoint);

      // Transform posts and include search-specific fields
      const transformedPosts: SearchPost[] = response.posts.map((post) => ({
        ...transformPost(post),
        snippet: post.snippet,
        relevanceScore: post.relevanceScore,
      }));

      if (reset) {
        setPosts(transformedPosts);
      } else {
        setPosts((prev) => [...prev, ...transformedPosts]);
      }

      setTotalResults(response.pagination.total);
      setHasMore(pageNum < response.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial search and when query/sort changes
  useEffect(() => {
    if (query.trim().length >= 2) {
      addRecentSearch(query);
      setPage(1);
      setPosts([]);
      fetchSearchResults(1, true);
    } else {
      setPosts([]);
      setIsLoading(false);
    }
  }, [query, currentSort]);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading && posts.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSearchResults(nextPage);
    }
  }, [inView]);

  // Handle sort change
  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
    searchParams.set('sort', sort);
    setSearchParams(searchParams);
  };

  // Navigate to post page
  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  // Get tag label
  const getTagLabel = (tag: string) => {
    const labels = TAG_LABELS[tag];
    if (!labels) return tag.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    return isTeluguLang ? labels.te : labels.en;
  };

  // Render highlighted snippet
  const renderSnippet = (snippet?: string) => {
    if (!snippet) return null;
    return (
      <p
        className="text-sm text-dark-300 mt-2 line-clamp-2 [&>mark]:bg-primary-500/30 [&>mark]:text-primary-200 [&>mark]:px-0.5 [&>mark]:rounded"
        dangerouslySetInnerHTML={{ __html: snippet }}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/feed"
            className="btn-ghost p-2 rounded-full hover:bg-dark-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {query.trim().length >= 2 ? (
                <>Search results for "{query}"</>
              ) : (
                'Search Confessions'
              )}
            </h1>
            {totalResults > 0 && (
              <p className="text-sm text-dark-400 mt-1">
                {totalResults} {totalResults === 1 ? 'result' : 'results'} found
              </p>
            )}
          </div>
        </div>

        {/* Sort Tabs */}
        {query.trim().length >= 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  currentSort === option.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-dark-100'
                )}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Query too short */}
      {query.trim().length > 0 && query.trim().length < 2 && (
        <div className="card text-center py-12">
          <Search className="mx-auto text-dark-500 mb-4" size={48} />
          <p className="text-dark-400 text-lg">
            Please enter at least 2 characters to search
          </p>
        </div>
      )}

      {/* No query */}
      {!query.trim() && (
        <div className="card text-center py-12">
          <Search className="mx-auto text-dark-500 mb-4" size={48} />
          <p className="text-dark-400 text-lg">
            Enter a search term to find confessions
          </p>
          <p className="text-dark-500 mt-2">Search by content, tags, or mood</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-900/20 border-red-700/50 text-red-300 text-center py-8">
          <p>{error}</p>
          <button
            onClick={() => fetchSearchResults(1, true)}
            className="btn-secondary mt-4"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Search Results - Each card is clickable */}
      {query.trim().length >= 2 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <article
              key={post._id}
              onClick={() => handlePostClick(post._id)}
              className="card hover:border-primary-500/50 hover:bg-dark-800/50 transition-all cursor-pointer group"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-dark-300 font-medium">
                    {post.authorAlias || post.author?.username || 'Anonymous'}
                  </span>
                  <span className="text-dark-600">•</span>
                  <span className="text-dark-500 flex items-center gap-1">
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {post.mood && (
                  <span className="text-lg" title={post.mood}>
                    {MOOD_EMOJIS[post.mood]}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-primary-500/20 text-primary-300 rounded text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/feed/tag?tag=${tag}`);
                    }}
                  >
                    {getTagLabel(tag)}
                  </span>
                ))}
                {post.nsfwLevel !== 'normal' && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs">
                    {post.nsfwLevel === 'extreme' ? '🔞 Extreme' : '18+'}
                  </span>
                )}
              </div>

              {/* Snippet with highlighting */}
              {post.snippet ? (
                renderSnippet(post.snippet)
              ) : (
                <p className="text-dark-200 text-sm line-clamp-2">
                  {post.content.length > 150
                    ? post.content.substring(0, 150) + '...'
                    : post.content}
                </p>
              )}

              {/* Stats Footer */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dark-800">
                {/* Vote count */}
                <div className="flex items-center gap-1 text-dark-400">
                  <div className="flex items-center">
                    <ChevronUp size={16} className="text-green-500" />
                    <ChevronDown size={16} className="text-red-500 -ml-1" />
                  </div>
                  <span className="text-sm font-medium">
                    {post.upvotes - post.downvotes}
                  </span>
                </div>

                {/* Comments */}
                <div className="flex items-center gap-1 text-dark-400">
                  <MessageCircle size={14} />
                  <span className="text-sm">{post.commentCount}</span>
                </div>

                {/* Relevance score - only show when sorting by relevance */}
                {currentSort === 'relevance' &&
                  post.relevanceScore !== undefined &&
                  post.relevanceScore > 0 && (
                    <span className="ml-auto text-xs text-primary-400/70">
                      {Math.round(post.relevanceScore * 100)}% match
                    </span>
                  )}

                {/* Click hint */}
                <span className="ml-auto text-xs text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to read →
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-primary-400" size={32} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && query.trim().length >= 2 && posts.length === 0 && !error && (
        <div className="card text-center py-12">
          <Search className="mx-auto text-dark-500 mb-4" size={48} />
          <p className="text-dark-400 text-lg">
            No confessions found for "{query}"
          </p>
          <p className="text-dark-500 mt-2">
            Try different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Load More Trigger */}
      {hasMore && !isLoading && posts.length > 0 && (
        <div ref={loadMoreRef} className="h-10" />
      )}

      {/* End of Results */}
      {!hasMore && posts.length > 0 && (
        <p className="text-center text-dark-500 py-4">
          You've seen all {totalResults} results
        </p>
      )}
    </div>
  );
}
