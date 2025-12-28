import { useState, useEffect } from 'react';
import { Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import CommentCard from './CommentCard';
import { apiGet, apiPost } from '@services/api';
import { Comment } from '../../types';
import { useAuthStore } from '@store/authStore';

interface CommentSectionProps {
  postId: string;
  isLocked: boolean;
}

type SortOption = 'best' | 'mostVotes' | 'newest' | 'oldest';

export default function CommentSection({ postId, isLocked }: CommentSectionProps) {
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('best');

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await apiGet<{ comments: Comment[] }>(
        `/comments/post/${postId}`
      );
      setComments(response.comments);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      openAuthModal(() => handleSubmit(e));
      return;
    }

    if (isLocked) {
      toast.error('Comments are locked for this post');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiPost<{ comment: Comment }>(
        `/comments/post/${postId}`,
        { content: newComment }
      );

      setComments((prev) => [response.comment, ...prev]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recursive function to find and update a comment in the nested tree
  const findAndUpdateComment = (
    commentsList: Comment[],
    parentId: string,
    newReply: Comment
  ): Comment[] => {
    return commentsList.map((comment) => {
      if (comment.id === parentId) {
        // Found the parent, add the reply
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      } else if (comment.replies && comment.replies.length > 0) {
        // Search in nested replies
        return {
          ...comment,
          replies: findAndUpdateComment(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const response = await apiPost<{ comment: Comment }>(
        `/comments/post/${postId}/reply/${parentId}`,
        { content }
      );

      // Update the comment tree recursively
      setComments((prev) => findAndUpdateComment(prev, parentId, response.comment));

      return response.comment;
    } catch (error) {
      toast.error('Failed to add reply');
      throw error;
    }
  };

  // Recursive function to delete a comment from the nested tree
  const findAndDeleteComment = (
    commentsList: Comment[],
    commentId: string
  ): Comment[] => {
    // Filter out the comment at this level
    const filtered = commentsList.filter((c) => c.id !== commentId);

    // If nothing was filtered, search in nested replies
    if (filtered.length === commentsList.length) {
      return commentsList.map((comment) => ({
        ...comment,
        replies: comment.replies
          ? findAndDeleteComment(comment.replies, commentId)
          : [],
      }));
    }

    return filtered;
  };

  const handleDelete = (commentId: string) => {
    setComments((prev) => findAndDeleteComment(prev, commentId));
  };

  // Sort comments based on selected option
  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'best':
        // Best = combination of upvotes and recency
        const scoreA = (a.upvotes - a.downvotes) + (1 / (Date.now() - new Date(a.createdAt).getTime()));
        const scoreB = (b.upvotes - b.downvotes) + (1 / (Date.now() - new Date(b.createdAt).getTime()));
        return scoreB - scoreA;
      case 'mostVotes':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Count total comments (including nested replies)
  const countAllComments = (commentsList: Comment[]): number => {
    return commentsList.reduce((count, comment) => {
      return count + 1 + (comment.replies ? countAllComments(comment.replies) : 0);
    }, 0);
  };

  const totalCommentCount = countAllComments(comments);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold flex-shrink-0">
          {totalCommentCount} {totalCommentCount === 1 ? 'Comment' : 'Comments'}
        </h2>

        {/* Sort Filters */}
        <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
          {(['best', 'mostVotes', 'newest', 'oldest'] as SortOption[]).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                sortBy === option
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-dark-200'
              }`}
            >
              {option === 'best' && 'Best'}
              {option === 'mostVotes' && 'Top'}
              {option === 'newest' && 'New'}
              {option === 'oldest' && 'Old'}
            </button>
          ))}
        </div>
      </div>

      {/* Add Comment Form */}
      {!isLocked ? (
        <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 w-full max-w-full">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isAuthenticated ? "Share your thoughts..." : "Login to comment..."}
            className="input flex-1 min-w-0"
            maxLength={2000}
            disabled={isSubmitting}
            onFocus={(e) => {
              if (!isAuthenticated) {
                e.target.blur();
                openAuthModal();
              }
            }}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="btn-primary px-3 sm:px-4 flex-shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      ) : (
        <div className="bg-dark-800 rounded-lg p-4 text-center text-dark-400">
          Comments are locked for this post
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-primary-400" size={24} />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-dark-500">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment, index) => (
            <CommentCard
              key={comment.id || `comment-${index}`}
              comment={comment}
              postId={postId}
              onReply={handleReply}
              onDelete={handleDelete}
              depth={0}
              parentPath={[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
