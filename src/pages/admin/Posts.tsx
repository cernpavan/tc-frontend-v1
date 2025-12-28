import { useState, useEffect } from 'react';
import {
  FileText,
  Trash2,
  RotateCcw,
  Lock,
  Unlock,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, AdminPost, Pagination } from '@services/adminApi';

export default function Posts() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminService.getPosts(page, 20);
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSoftDelete = async (postId: string) => {
    setActionLoading(postId);
    try {
      await adminService.softDeletePost(postId);
      toast.success('Post soft deleted');
      fetchPosts(pagination?.page);
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setActionLoading(null);
    }
  };

  const handleHardDelete = async (postId: string) => {
    if (!confirm('Permanently delete this post? This cannot be undone.')) return;
    setActionLoading(postId);
    try {
      await adminService.hardDeletePost(postId);
      toast.success('Post permanently deleted');
      fetchPosts(pagination?.page);
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (postId: string) => {
    setActionLoading(postId);
    try {
      await adminService.restorePost(postId);
      toast.success('Post restored');
      fetchPosts(pagination?.page);
    } catch (error) {
      toast.error('Failed to restore post');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLockToggle = async (postId: string) => {
    setActionLoading(postId);
    try {
      await adminService.lockPost(postId);
      toast.success('Post lock toggled');
      fetchPosts(pagination?.page);
    } catch (error) {
      toast.error('Failed to toggle lock');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Posts Moderation</h1>
          <p className="text-dark-400 mt-1">Manage and moderate all posts</p>
        </div>
        <div className="text-sm text-dark-400">
          Total: {pagination?.total || 0} posts
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
        <input
          type="text"
          placeholder="Search posts or users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-dark-900 border border-dark-800 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Posts Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  NSFW
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-dark-800/30">
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-white line-clamp-2">{post.content}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-xs bg-dark-700 text-dark-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-dark-500">
                            +{post.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">
                    {post.author?.username || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.nsfwLevel === 'extreme'
                          ? 'bg-red-500/20 text-red-400'
                          : post.nsfwLevel === 'explicit'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {post.nsfwLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {post.isSoftDeleted && (
                        <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                          Deleted
                        </span>
                      )}
                      {post.isLocked && (
                        <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                          Locked
                        </span>
                      )}
                      {!post.isSoftDeleted && !post.isLocked && (
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-400">
                    <div className="space-y-1">
                      <div>+{post.upvotes} / -{post.downvotes}</div>
                      <div className="text-xs">{post.commentCount} comments</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleLockToggle(post.id)}
                        disabled={actionLoading === post.id}
                        className="p-2 text-dark-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                        title={post.isLocked ? 'Unlock' : 'Lock'}
                      >
                        {post.isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                      {post.isSoftDeleted ? (
                        <button
                          onClick={() => handleRestore(post.id)}
                          disabled={actionLoading === post.id}
                          className="p-2 text-dark-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Restore"
                        >
                          <RotateCcw size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSoftDelete(post.id)}
                          disabled={actionLoading === post.id}
                          className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Soft Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleHardDelete(post.id)}
                        disabled={actionLoading === post.id}
                        className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Permanent Delete"
                      >
                        <AlertCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No posts found</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-800">
            <p className="text-sm text-dark-400">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPosts(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 text-dark-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => fetchPosts(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 text-dark-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Post Details</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 text-dark-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-dark-400">Content</label>
                <p className="text-white mt-1">{selectedPost.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400">Author</label>
                  <p className="text-white mt-1">
                    {selectedPost.author?.username || 'Anonymous'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Created</label>
                  <p className="text-white mt-1">
                    {new Date(selectedPost.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400">NSFW Level</label>
                  <p className="text-white mt-1 capitalize">{selectedPost.nsfwLevel}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Mood</label>
                  <p className="text-white mt-1 capitalize">{selectedPost.mood}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400">Tags</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-sm bg-dark-700 text-dark-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-dark-400">Upvotes</label>
                  <p className="text-green-400 mt-1 font-medium">{selectedPost.upvotes}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Downvotes</label>
                  <p className="text-red-400 mt-1 font-medium">{selectedPost.downvotes}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Comments</label>
                  <p className="text-white mt-1 font-medium">{selectedPost.commentCount}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-dark-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  handleLockToggle(selectedPost.id);
                  setSelectedPost(null);
                }}
                className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
              >
                {selectedPost.isLocked ? 'Unlock' : 'Lock'}
              </button>
              {selectedPost.isSoftDeleted ? (
                <button
                  onClick={() => {
                    handleRestore(selectedPost.id);
                    setSelectedPost(null);
                  }}
                  className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  Restore
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleSoftDelete(selectedPost.id);
                    setSelectedPost(null);
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
