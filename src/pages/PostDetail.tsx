import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PostCard from '@components/post/PostCard';
import CommentSection from '@components/comment/CommentSection';
import { apiGet } from '@services/api';
import { Post } from '../types';
import { transformPost } from '@utils/postTransform';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiGet<{ post: any }>(`/posts/${id}`);
        // Transform backend post to frontend format
        const transformedPost = transformPost(response.post);
        setPost(transformedPost);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary-400" size={40} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-400 text-lg mb-4">{error || 'Post not found'}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dark-400 hover:text-dark-200 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      {/* Post */}
      <PostCard post={post} showFullContent />

      {/* Comment Guidance */}
      {post.adviceMode === 'just-sharing' && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 text-sm text-blue-300">
          💡 This person is just sharing their story. Please avoid giving unsolicited advice.
        </div>
      )}

      {/* Comments */}
      <CommentSection postId={post._id} isLocked={false} />
    </div>
  );
}
