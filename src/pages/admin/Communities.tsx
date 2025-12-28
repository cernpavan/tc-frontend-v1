import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Loader2, X, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { Community } from '../../types';
import { useAdminAuthStore } from '@store/adminAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function AdminCommunities() {
  const { token, admin } = useAdminAuthStore();
  const isAdmin = admin?.role === 'admin';
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    icon: '',
    color: '#6366f1',
  });

  const fetchCommunities = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/communities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCommunities(data.data.communities || []);
      }
    } catch (error) {
      toast.error('Failed to fetch communities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCommunities();
    }
  }, [token]);

  const handleOpenModal = (community?: Community) => {
    if (community) {
      setEditingCommunity(community);
      setFormData({
        name: community.name,
        description: community.description || '',
        slug: community.slug,
        icon: community.icon || '',
        color: community.color || '#6366f1',
      });
    } else {
      setEditingCommunity(null);
      setFormData({
        name: '',
        description: '',
        slug: '',
        icon: '',
        color: '#6366f1',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCommunity(null);
    setFormData({
      name: '',
      description: '',
      slug: '',
      icon: '',
      color: '#6366f1',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCommunity
        ? `${API_BASE_URL}/admin/communities/${editingCommunity.id}`
        : `${API_BASE_URL}/admin/communities`;

      const response = await fetch(url, {
        method: editingCommunity ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || `Community ${editingCommunity ? 'updated' : 'created'} successfully`);
        handleCloseModal();
        fetchCommunities();
      } else {
        toast.error(data.error?.message || 'Failed to save community');
      }
    } catch (error) {
      toast.error('Failed to save community');
    }
  };

  const handleDelete = async (community: Community) => {
    if (!confirm(`Are you sure you want to delete "${community.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/communities/${community.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Community deleted successfully');
        fetchCommunities();
      } else {
        toast.error(data.error?.message || 'Failed to delete community');
      }
    } catch (error) {
      toast.error('Failed to delete community');
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  // Only admin can manage communities
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="w-12 h-12 text-dark-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
        <p className="text-dark-400">Only admins can manage communities</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Communities</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
        >
          <Plus size={18} />
          <span>Create Community</span>
        </button>
      </div>

      {/* Mobile: Card Layout */}
      <div className="block lg:hidden space-y-3">
        {communities.map((community) => (
          <div
            key={community.id}
            className="bg-dark-900 rounded-xl p-4 border border-dark-800"
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: community.color || '#6366f1',
            }}
          >
            {/* Community Header */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-2xl w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ backgroundColor: `${community.color}30` }}
              >
                {community.icon || '💬'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-base truncate">{community.name}</div>
                <div className="text-xs text-dark-500 truncate">/{community.slug}</div>
              </div>
            </div>

            {/* Description */}
            {community.description && (
              <p className="text-sm text-dark-400 mb-3 line-clamp-2">
                {community.description}
              </p>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <span className="bg-dark-800 text-dark-300 px-2.5 py-1 rounded-full">
                {community.postCount} posts
              </span>
              <span className="bg-dark-800 text-dark-300 px-2.5 py-1 rounded-full">
                Created {new Date(community.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-dark-800">
              <button
                onClick={() => handleOpenModal(community)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-dark-800 text-primary-400 rounded-lg hover:bg-dark-700 transition-colors min-h-[44px]"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(community)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-dark-800 text-red-400 rounded-lg hover:bg-dark-700 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={community.postCount > 0}
                title={community.postCount > 0 ? 'Cannot delete community with posts' : 'Delete community'}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}

        {communities.length === 0 && (
          <div className="text-center py-12 text-dark-400 bg-dark-900 rounded-xl">
            <Plus size={48} className="mx-auto mb-4 opacity-50" />
            <p>No communities yet. Create one to get started!</p>
          </div>
        )}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden lg:block bg-dark-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Community
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Posts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-dark-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {communities.map((community) => (
              <tr key={community.id} className="hover:bg-dark-800/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-2xl w-10 h-10 flex items-center justify-center rounded-full"
                      style={{ backgroundColor: `${community.color}30` }}
                    >
                      {community.icon || '💬'}
                    </span>
                    <div>
                      <div className="font-medium">{community.name}</div>
                      {community.description && (
                        <div className="text-sm text-dark-400 truncate max-w-xs">
                          {community.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                  /{community.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {community.postCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">
                  {new Date(community.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(community)}
                    className="text-primary-400 hover:text-primary-300 mr-3"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(community)}
                    className="text-red-400 hover:text-red-300"
                    disabled={community.postCount > 0}
                    title={
                      community.postCount > 0
                        ? 'Cannot delete community with posts'
                        : 'Delete community'
                    }
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {communities.length === 0 && (
          <div className="text-center py-12 text-dark-400">
            No communities yet. Create one to get started!
          </div>
        )}
      </div>

      {/* Modal - Mobile Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-dark-900 rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-dark-900 flex justify-between items-center p-4 sm:p-6 border-b border-dark-800 z-10">
              <h2 className="text-lg sm:text-xl font-bold">
                {editingCommunity ? 'Edit Community' : 'Create Community'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-dark-400 hover:text-dark-200 p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (!editingCommunity) {
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      }));
                    }
                  }}
                  className="input"
                  required
                  placeholder="Community name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setFormData({ ...formData, slug: value });
                  }}
                  className="input"
                  required
                  placeholder="community-slug"
                  title="Only lowercase letters, numbers, and hyphens"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[80px]"
                  rows={3}
                  placeholder="Brief description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="input text-center text-2xl"
                    placeholder="icon"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-[46px] rounded cursor-pointer border-0"
                  />
                </div>
              </div>

              {/* Action Buttons - Sticky on mobile */}
              <div className="flex gap-3 pt-4 sticky bottom-0 bg-dark-900 pb-safe">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary flex-1 min-h-[48px]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 min-h-[48px]">
                  {editingCommunity ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
