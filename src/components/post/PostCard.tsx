import { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Flag,
  Share2,
  Clock,
  Languages,
  Eye,
  EyeOff,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { Post } from '../../types';
import { useAuthStore } from '@store/authStore';
import ReactionBar from './ReactionBar';
import ReportModal from '@components/common/ReportModal';
import { apiPost, apiDelete } from '@services/api';

interface PostCardProps {
  post: Post;
  showFullContent?: boolean;
}

// Fallback tag labels for display (will be used if tag info not loaded from API)
const tagLabels: Record<string, { en: string; te: string }> = {
  'sexual-confession': { en: 'Sexual Confession', te: 'లైంగిక ఒప్పుకోలు' },
  'fantasy-kinks': { en: 'Fantasy / Kinks', te: 'ఫాంటసీ' },
  'relationship-affair': { en: 'Relationship', te: 'సంబంధం' },
  'guilt-regret': { en: 'Guilt / Regret', te: 'అపరాధ భావం' },
  'cheating': { en: 'Cheating', te: 'మోసం' },
  'one-night-story': { en: 'One Night', te: 'ఒక రాత్రి' },
  'adult-advice': { en: 'Adult Advice', te: 'సలహా' },
  'dark-thoughts': { en: 'Dark Thoughts', te: 'చీకటి ఆలోచనలు' },
  'curiosity-question': { en: 'Curiosity', te: 'ఆసక్తి' },
};

// Helper to format unknown tags
const formatTagLabel = (tag: string, isTeluguLang: boolean): string => {
  const knownTag = tagLabels[tag];
  if (knownTag) {
    return isTeluguLang ? knownTag.te : knownTag.en;
  }
  // Format unknown tags: convert slug to title case
  return tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const moodEmojis: Record<string, string> = {
  horny: '🔥',
  lonely: '😔',
  guilty: '😣',
  curious: '🤔',
  happy: '😊',
};

function PostCardComponent({ post, showFullContent = false }: PostCardProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const [isRevealed, setIsRevealed] = useState(user?.showNsfw || false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [voteCount, setVoteCount] = useState(post.upvotes - post.downvotes);
  const [myVote, setMyVote] = useState<'upvote' | 'downvote' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Check if current user is the author
  const isAuthor = isAuthenticated && user?.id === post.author?._id;

  const currentLanguage = isAuthenticated ? user?.language : (localStorage.getItem('guest-language') || 'english');
  const isTeluguLang = currentLanguage === 'telugu';
  const isNsfw = post.nsfwLevel === 'explicit' || post.nsfwLevel === 'extreme';
  const shouldBlur = isNsfw && !isRevealed;

  const content = showTranslation
    ? (isTeluguLang ? post.contentTranslated?.telugu : post.contentTranslated?.english) || post.content
    : post.content;


  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      openAuthModal(() => handleVote(voteType));
      return;
    }

    if (isVoting) return;

    const previousVote = myVote;
    const previousCount = voteCount;

    // OPTIMISTIC UPDATE - Update UI instantly before API call
    if (myVote === voteType) {
      // Toggle off
      setMyVote(null);
      setVoteCount(voteType === 'upvote' ? voteCount - 1 : voteCount + 1);
    } else {
      // Add or change vote
      let newCount = voteCount;
      if (previousVote === 'upvote') newCount -= 1;
      else if (previousVote === 'downvote') newCount += 1;
      newCount += voteType === 'upvote' ? 1 : -1;

      setMyVote(voteType);
      setVoteCount(newCount);
    }

    setIsVoting(true);

    try {
      if (previousVote === voteType) {
        // Remove vote (toggle off)
        await apiDelete(`/reactions/post/${post._id}/vote`);
      } else {
        // Add or change vote
        await apiPost(`/reactions/post/${post._id}/vote`, { voteType });
      }
    } catch (error) {
      toast.error('Failed to vote');
      // Revert on error
      setMyVote(previousVote);
      setVoteCount(previousCount);
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      await navigator.share({ url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleDeletePost = async () => {
    if (!isAuthor) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/posts/${post._id}`);
      toast.success('Post deleted successfully');
      setShowDeleteConfirm(false);
      setIsDeleted(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if user is clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.tagName === 'A'
    ) {
      return;
    }
    // Navigate to post detail
    navigate(`/post/${post._id}`);
  };

  // If post was deleted, show deleted state
  if (isDeleted) {
    return (
      <article className="card bg-dark-900/50 border-dark-800">
        <div className="text-center py-6">
          <Trash2 className="w-8 h-8 text-dark-500 mx-auto mb-2" />
          <p className="text-dark-400">This post has been deleted</p>
        </div>
      </article>
    );
  }

  return (
    <article
      className="card-interactive group"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="card-header flex items-start justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
          <span className="post-username text-dark-400 md:text-dark-300 text-xs md:text-sm font-medium">
            {post.authorAlias || post.author?.username || 'Anonymous'}
          </span>
          {post.community && (
            <>
              <span className="text-dark-600 text-xs md:text-sm">in</span>
              <Link
                to={`/community/${post.community.slug}`}
                className="community-link flex items-center gap-1 text-xs md:text-sm px-1.5 md:px-2 py-0.5 rounded-full hover:bg-dark-800 transition-colors"
                style={{ color: post.community.color || '#6366f1' }}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm md:text-base">{post.community.icon}</span>
                <span>{post.community.name}</span>
              </Link>
            </>
          )}
          <span className="text-dark-600 text-xs">•</span>
          <span className="post-timestamp text-dark-500 text-xs flex items-center gap-1">
            <Clock size={10} className="md:w-3 md:h-3" />
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>

        {/* Mood */}
        {post.mood && (
          <span className="mood-emoji text-base md:text-lg" title={post.mood}>
            {moodEmojis[post.mood]}
          </span>
        )}
      </div>

      {/* Title */}
      {post.title && (
        <h2 className="post-title text-base md:text-lg font-semibold text-dark-100 mb-1 md:mb-2 line-clamp-2">
          {post.title}
        </h2>
      )}

      {/* Tags */}
      <div className="post-tags flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            to={`/feed/tag/${tag}`}
            className="badge-primary text-[10px] md:text-xs"
          >
            {formatTagLabel(tag, isTeluguLang)}
          </Link>
        ))}

        {isNsfw && (
          <span className="badge-nsfw text-[10px] md:text-xs">
            {post.nsfwLevel === 'extreme' ? '🔞 Extreme' : '18+'}
          </span>
        )}

        {post.adviceMode === 'want-advice' && (
          <span className="badge bg-green-900/50 text-green-300 border-green-700/50 text-[10px] md:text-xs">
            Advice
          </span>
        )}
      </div>

      {/* Content */}
      <div
        className={clsx(
          'relative mb-2 md:mb-4',
          shouldBlur && 'select-none'
        )}
      >
        <p
          className={clsx(
            'post-content text-dark-200 whitespace-pre-wrap text-sm md:text-base leading-snug md:leading-relaxed',
            shouldBlur && 'nsfw-blur',
            !showFullContent && 'line-clamp-2 md:line-clamp-3'
          )}
        >
          {content}
        </p>

        {/* NSFW Overlay */}
        {shouldBlur && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900/50 rounded-lg">
            <button
              onClick={() => setIsRevealed(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Eye size={18} />
              Reveal Content
            </button>
          </div>
        )}

        {/* Hide button after reveal */}
        {isNsfw && isRevealed && !user?.showNsfw && (
          <button
            onClick={() => setIsRevealed(false)}
            className="absolute top-2 right-2 btn-ghost p-1"
            title="Hide content"
          >
            <EyeOff size={16} />
          </button>
        )}
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div
          className={clsx(
            'grid gap-2 mb-4',
            post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          )}
        >
          {post.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt=""
              className={clsx(
                'rounded-lg w-full object-cover max-h-80',
                shouldBlur && 'nsfw-blur'
              )}
            />
          ))}
        </div>
      )}

      {/* Reactions */}
      <ReactionBar post={post} />

      {/* Footer Actions */}
      <div className="card-footer flex items-center justify-between mt-2 md:mt-4 pt-2 md:pt-3 border-t border-dark-800 overflow-x-hidden">
        <div className="flex items-center gap-1.5 sm:gap-4 flex-1 min-w-0">
          {/* Votes - Horizontal Reddit Style with improved touch targets */}
          <div className="flex items-center bg-dark-800 rounded-full">
            <button
              onClick={() => handleVote('upvote')}
              disabled={isVoting}
              className={clsx(
                'vote-btn text-lg font-bold',
                myVote === 'upvote'
                  ? 'vote-btn-active-up animate-vote-pop'
                  : ''
              )}
              title="Upvote"
              aria-label="Upvote"
            >
              ⬆
            </button>
            <span className={clsx(
              'text-xs md:text-sm font-bold min-w-[1.75rem] md:min-w-[2.5rem] text-center transition-colors duration-150',
              myVote === 'upvote' && 'text-vote-up',
              myVote === 'downvote' && 'text-vote-down',
              !myVote && 'text-dark-300'
            )}>
              {voteCount}
            </span>
            <button
              onClick={() => handleVote('downvote')}
              disabled={isVoting}
              className={clsx(
                'vote-btn vote-btn-down text-lg font-bold',
                myVote === 'downvote'
                  ? 'vote-btn-active-down animate-vote-pop'
                  : ''
              )}
              title="Downvote"
              aria-label="Downvote"
            >
              ⬇
            </button>
          </div>

          {/* Comments */}
          <Link
            to={`/post/${post._id}`}
            className="flex items-center gap-1 px-1.5 md:px-2 py-1 md:py-1.5 rounded-full text-dark-400 hover:text-primary-400 hover:bg-primary-400/10 transition-colors"
            aria-label={`${post.commentCount} comments`}
          >
            <MessageCircle size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="text-xs md:text-sm font-medium">{post.commentCount}</span>
          </Link>

          {/* Translate */}
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={clsx(
              'flex items-center gap-1 p-1.5 md:p-2 rounded-full transition-colors',
              showTranslation ? 'text-primary-400 bg-primary-400/10' : 'text-dark-400 hover:text-primary-400 hover:bg-primary-400/10'
            )}
            title={showTranslation ? 'Show original' : 'Translate'}
            aria-label={showTranslation ? 'Show original' : 'Translate'}
          >
            <Languages size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 md:gap-1">
          {/* Share */}
          <button
            onClick={handleShare}
            className="btn-icon-sm bg-transparent text-dark-400 hover:text-dark-200 hover:bg-dark-800"
            title="Share"
            aria-label="Share post"
          >
            <Share2 size={16} className="md:w-[18px] md:h-[18px]" />
          </button>

          {/* More Menu (contains Report and Delete for author) */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="btn-icon-sm bg-transparent text-dark-400 hover:text-dark-200 hover:bg-dark-800"
              title="More options"
              aria-label="More options"
            >
              <MoreVertical size={16} className="md:w-[18px] md:h-[18px]" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-8 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-20 min-w-[140px] py-1">
                  {/* Report - always visible */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      setShowReportModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-dark-300 hover:bg-dark-700 flex items-center gap-2"
                  >
                    <Flag size={16} />
                    Report
                  </button>

                  {/* Delete - only for author */}
                  {isAuthor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-dark-700 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expiry Notice - hidden on mobile */}
      {post.expiresAt && (
        <p className="expiry-notice text-xs text-dark-500 mt-2 md:mt-3 flex items-center gap-1 hidden md:flex">
          <Clock size={12} />
          Expires {formatDistanceToNow(new Date(post.expiresAt), { addSuffix: true })}
        </p>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          targetType="post"
          targetId={post._id}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-dark-900 border border-dark-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-dark-800">
              <h2 className="text-lg font-semibold text-white">Delete Post</h2>
            </div>
            <div className="p-6">
              <p className="text-dark-300 mb-4">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-dark-800 flex justify-end gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-dark-800 text-dark-300 rounded-lg hover:bg-dark-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePost();
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// Memoize PostCard to prevent re-renders when parent re-renders
const PostCard = memo(PostCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.post._id === nextProps.post._id &&
    prevProps.post.upvotes === nextProps.post.upvotes &&
    prevProps.post.downvotes === nextProps.post.downvotes &&
    prevProps.post.commentCount === nextProps.post.commentCount &&
    prevProps.showFullContent === nextProps.showFullContent
  );
});

PostCard.displayName = "PostCard";

export default PostCard;

