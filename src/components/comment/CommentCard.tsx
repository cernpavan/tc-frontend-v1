import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Languages,
  MoreHorizontal,
  Share2,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { Comment } from '../../types';
import { useAuthStore } from '@store/authStore';
import { apiDelete, apiPost, apiGet } from '@services/api';
import toast from 'react-hot-toast';

interface CommentCardProps {
  comment: Comment;
  postId: string;
  onReply: (parentId: string, content: string) => Promise<Comment>;
  onDelete: (commentId: string) => void;
  depth?: number;
  parentPath?: string[];
}

const MAX_DEPTH = 10;
const THREAD_LINE_COLORS = [
  'border-blue-500/40',
  'border-green-500/40',
  'border-purple-500/40',
  'border-orange-500/40',
  'border-pink-500/40',
  'border-cyan-500/40',
  'border-yellow-500/40',
  'border-red-500/40',
];

export default function CommentCard({
  comment,
  postId,
  onReply,
  onDelete,
  depth = 0,
  parentPath = [],
}: CommentCardProps) {
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [voteCount, setVoteCount] = useState(comment.upvotes - comment.downvotes);
  const [myVote, setMyVote] = useState<'upvote' | 'downvote' | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const currentLanguage = isAuthenticated ? user?.language : (localStorage.getItem('guest-language') || 'english');
  const isTeluguLang = currentLanguage === 'telugu';
  const isOwner = isAuthenticated && comment.author.id === user?.id;
  const isDeepNested = depth >= MAX_DEPTH;
  const threadLineColor = THREAD_LINE_COLORS[depth % THREAD_LINE_COLORS.length];

  const content = showTranslation
    ? (isTeluguLang ? comment.contentTranslated?.telugu : comment.contentTranslated?.english) || comment.content
    : comment.content;

  // Fetch user's current vote on mount
  useEffect(() => {
    if (isAuthenticated && comment.id) {
      fetchMyVote();
    }
  }, [comment.id, isAuthenticated]);

  const fetchMyVote = async () => {
    if (!comment.id) return;
    try {
      const response = await apiGet<{ voteType: 'upvote' | 'downvote' | null }>(
        `/reactions/comment/${comment.id}/my-vote`
      );
      if (response.voteType) {
        setMyVote(response.voteType);
      }
    } catch (error) {
      // Silently fail
    }
  };

  // Voting functionality for comments
  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      openAuthModal(() => handleVote(voteType));
      return;
    }

    if (isVoting || !comment.id) return;

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
        await apiDelete(`/reactions/comment/${comment.id}/vote`);
      } else {
        // Add or change vote
        await apiPost(`/reactions/comment/${comment.id}/vote`, { voteType });
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

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsReplying(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
      toast.success('Reply added');
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await apiDelete(`/comments/${comment.id}`);
      onDelete(comment.id);
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleShare = () => {
    // Copy comment link to clipboard
    const url = `${window.location.origin}/post/${postId}#comment-${comment.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleContinueThread = () => {
    // Navigate to a dedicated thread view (could be implemented later)
    window.location.hash = `comment-${comment.id}`;
    toast('Opening thread view...');
  };

  const replyCount = comment.replies?.length || 0;

  return (
    <div
      id={`comment-${comment.id}`}
      className={clsx(
        'relative group',
        depth > 0 && 'mt-3'
      )}
      style={{
        marginLeft: depth > 0 ? `${Math.min(depth * 16, 160)}px` : '0',
      }}
    >
      {/* Thread Line */}
      {depth > 0 && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            'absolute left-0 top-0 bottom-0 w-0.5 transition-all',
            'hover:w-1 cursor-pointer',
            isCollapsed ? 'bg-dark-700' : threadLineColor,
            'hover:bg-primary-500'
          )}
          title={isCollapsed ? 'Expand thread' : 'Collapse thread'}
          aria-label={isCollapsed ? 'Expand thread' : 'Collapse thread'}
        />
      )}

      {/* Collapse/Expand Button */}
      <div className="flex items-start gap-2 pl-3">
        {(depth > 0 || replyCount > 0) && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex-shrink-0 mt-1 text-dark-500 hover:text-primary-400 transition-colors"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronRight size={16} className="text-dark-500" />
            ) : (
              <ChevronDown size={16} className="text-dark-500" />
            )}
          </button>
        )}

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-dark-300 text-sm font-medium">
              {comment.author.username}
            </span>
            <span className="text-dark-600">•</span>
            <span className="text-dark-500 text-xs">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {isCollapsed && replyCount > 0 && (
              <span className="text-primary-400 text-xs">
                [{replyCount} {replyCount === 1 ? 'reply' : 'replies'}]
              </span>
            )}
          </div>

          {/* Content */}
          {!isCollapsed && (
            <>
              <p className="text-dark-200 whitespace-pre-wrap mb-2 text-sm leading-relaxed">
                {content}
              </p>

              {/* Actions - Reddit horizontal style with improved touch targets */}
              <div className="flex items-center gap-2 text-dark-500 text-xs mb-2">
                {/* Votes - Horizontal layout with proper touch targets */}
                <div className="flex items-center bg-dark-800 rounded-full">
                  <button
                    onClick={() => handleVote('upvote')}
                    disabled={isVoting || !comment.id}
                    className={clsx(
                      'w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-150',
                      myVote === 'upvote'
                        ? 'text-vote-up bg-vote-up/20 animate-vote-pop'
                        : 'text-dark-400 hover:text-vote-up hover:bg-vote-up/10'
                    )}
                    title="Upvote"
                    aria-label="Upvote"
                  >
                    ⬆
                  </button>
                  <span
                    className={clsx(
                      'text-xs font-bold min-w-[1.75rem] text-center transition-colors duration-150',
                      myVote === 'upvote' && 'text-vote-up',
                      myVote === 'downvote' && 'text-vote-down',
                      !myVote && 'text-dark-300'
                    )}
                  >
                    {voteCount}
                  </span>
                  <button
                    onClick={() => handleVote('downvote')}
                    disabled={isVoting || !comment.id}
                    className={clsx(
                      'w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-150',
                      myVote === 'downvote'
                        ? 'text-vote-down bg-vote-down/20 animate-vote-pop'
                        : 'text-dark-400 hover:text-vote-down hover:bg-vote-down/10'
                    )}
                    title="Downvote"
                    aria-label="Downvote"
                  >
                    ⬇
                  </button>
                </div>

                {/* Reply Button */}
                {!isDeepNested && (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        openAuthModal(() => setShowReplyForm(true));
                      } else {
                        setShowReplyForm(!showReplyForm);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg font-medium hover:bg-dark-800 hover:text-dark-200 transition-colors min-h-[32px]"
                    aria-label="Reply to comment"
                  >
                    Reply
                  </button>
                )}

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-medium hover:bg-dark-800 hover:text-dark-200 transition-colors min-h-[32px]"
                  aria-label="Share comment"
                >
                  <Share2 size={14} />
                  <span className="hidden sm:inline">Share</span>
                </button>

                {/* Translate */}
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center',
                    showTranslation ? 'text-primary-400 bg-primary-400/10' : 'hover:bg-dark-800 hover:text-dark-200'
                  )}
                  aria-label={showTranslation ? 'Show original' : 'Translate'}
                >
                  <Languages size={14} />
                </button>

                {/* Options */}
                {isOwner && (
                  <div className="relative">
                    <button
                      onClick={() => setShowOptions(!showOptions)}
                      className="p-1.5 rounded-lg hover:bg-dark-800 hover:text-dark-200 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                      aria-label="More options"
                    >
                      <MoreHorizontal size={14} />
                    </button>

                    {showOptions && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowOptions(false)}
                        />
                        <div className="absolute left-0 mt-1 bg-dark-850 border border-dark-750 rounded-xl shadow-xl py-1 z-20 min-w-[140px] animate-scale-in">
                          <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2.5 text-error-400 hover:bg-dark-800 w-full text-left min-h-[40px]"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              {showReplyForm && (
                <div className="mb-3 animate-fade-in">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="input flex-1 text-sm"
                      maxLength={2000}
                      disabled={isReplying}
                      autoFocus
                    />
                    <button
                      onClick={handleReply}
                      disabled={isReplying || !replyContent.trim()}
                      className="btn-primary text-sm"
                    >
                      {isReplying ? '...' : 'Reply'}
                    </button>
                    <button
                      onClick={() => setShowReplyForm(false)}
                      className="btn-ghost text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* "Continue this thread" for deep nesting */}
              {isDeepNested && replyCount > 0 && (
                <button
                  onClick={handleContinueThread}
                  className="flex items-center gap-2 text-primary-400 text-xs font-bold hover:text-primary-300 transition-colors mb-2"
                >
                  <ArrowRight size={12} />
                  <span>Continue this thread →</span>
                </button>
              )}

              {/* Nested Replies */}
              {!isDeepNested && comment.replies && comment.replies.length > 0 && (
                <div className="mt-1 space-y-0">
                  {comment.replies.map((reply, index) => (
                    <CommentCard
                      key={reply.id || `reply-${comment.id}-${index}`}
                      comment={reply}
                      postId={postId}
                      onReply={onReply}
                      onDelete={onDelete}
                      depth={depth + 1}
                      parentPath={[...parentPath, comment.id]}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
