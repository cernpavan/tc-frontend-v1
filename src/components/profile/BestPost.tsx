import { Link } from 'react-router-dom';
import { Trophy, Heart, MessageCircle } from 'lucide-react';

interface BestPostData {
  id: string;
  title: string;
  upvotes: number;
  commentCount: number;
}

interface Props {
  post: BestPostData | null;
}

export default function BestPost({ post }: Props) {
  if (!post) return null;

  return (
    <div className="card bg-gradient-to-br from-amber-900/40 via-yellow-900/40 to-amber-900/40 border-amber-700/30">
      <div className="flex items-start gap-3">
        <div className="p-3 bg-amber-500/20 rounded-full flex-shrink-0">
          <Trophy className="text-amber-400" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-amber-400 text-sm font-medium mb-2">Your Best Post</h3>
          <Link
            to={`/post/${post.id}`}
            className="font-semibold text-white hover:text-amber-300 transition-colors line-clamp-2 block mb-3"
          >
            {post.title}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-pink-400">
              <Heart size={16} />
              <span className="font-medium">{post.upvotes}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-400">
              <MessageCircle size={16} />
              <span className="font-medium">{post.commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
