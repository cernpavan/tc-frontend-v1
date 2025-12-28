import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Loader2, X, Hash, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminAuthStore } from '@store/adminAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface Tag {
  id: string;
  slug: string;
  name: string;
  nameTelugu?: string;
  description?: string;
  color: string;
  postCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTags() {
  const { token, admin } = useAdminAuthStore();
  const isAdmin = admin?.role === 'admin';
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    nameTelugu: '',
    description: '',
    color: '#6366f1',
  });

  const fetchTags = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTags(data.data.tags || []);
      }
    } catch (error) {
      toast.error('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTags();
    }
  }, [token]);

  const handleOpenModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        slug: tag.slug,
        nameTelugu: tag.nameTelugu || '',
        description: tag.description || '',
        color: tag.color || '#6366f1',
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        slug: '',
        nameTelugu: '',
        description: '',
        color: '#6366f1',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTag(null);
    setFormData({
      name: '',
      slug: '',
      nameTelugu: '',
      description: '',
      color: '#6366f1',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingTag
        ? `${API_BASE_URL}/admin/tags/${editingTag.id}`
        : `${API_BASE_URL}/admin/tags`;

      const response = await fetch(url, {
        method: editingTag ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || `Tag ${editingTag ? 'updated' : 'created'} successfully`);
        handleCloseModal();
        fetchTags();
      } else {
        toast.error(data.error?.message || 'Failed to save tag');
      }
    } catch (error) {
      toast.error('Failed to save tag');
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Are you sure you want to delete "${tag.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/tags/${tag.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Tag deleted successfully');
        fetchTags();
      } else {
        toast.error(data.error?.message || 'Failed to delete tag');
      }
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  const handleToggleActive = async (tag: Tag) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tags/${tag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...tag,
          isActive: !tag.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Tag ${!tag.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchTags();
      } else {
        toast.error(data.error?.message || 'Failed to update tag');
      }
    } catch (error) {
      toast.error('Failed to update tag');
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

  // Only admin can manage tags
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="w-12 h-12 text-dark-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
        <p className="text-dark-400">Only admins can manage tags</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Tag Management</h1>
          <p className="text-dark-400 text-xs sm:text-sm mt-1">
            Manage tags that users can select when posting confessions
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
        >
          <Plus size={18} />
          <span>Create Tag</span>
        </button>
      </div>

      {/* Mobile: Card Layout */}
      <div className="block lg:hidden space-y-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="bg-dark-900 rounded-xl p-4 border border-dark-800"
          >
            {/* Tag Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${tag.color}30`, color: tag.color }}
                >
                  <Hash size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-base truncate">{tag.name}</div>
                  <div className="text-xs text-dark-500 truncate">/{tag.slug}</div>
                </div>
              </div>
              {/* Status Toggle */}
              <button
                onClick={() => handleToggleActive(tag)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs min-h-[36px] flex-shrink-0 ${
                  tag.isActive
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-red-900/30 text-red-400'
                }`}
              >
                {tag.isActive ? (
                  <>
                    <ToggleRight size={14} />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={14} />
                    <span>Inactive</span>
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            {tag.description && (
              <p className="text-sm text-dark-400 mb-3 line-clamp-2">
                {tag.description}
              </p>
            )}

            {/* Tag Details Row */}
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              {tag.nameTelugu && (
                <span className="bg-dark-800 text-dark-300 px-2.5 py-1 rounded-full">
                  Telugu: {tag.nameTelugu}
                </span>
              )}
              <span className="bg-dark-800 text-dark-300 px-2.5 py-1 rounded-full">
                {tag.postCount} posts
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-dark-800">
              <button
                onClick={() => handleOpenModal(tag)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-dark-800 text-primary-400 rounded-lg hover:bg-dark-700 transition-colors min-h-[44px]"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(tag)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-dark-800 text-red-400 rounded-lg hover:bg-dark-700 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={tag.postCount > 0}
                title={tag.postCount > 0 ? 'Cannot delete tag with posts' : 'Delete tag'}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}

        {tags.length === 0 && (
          <div className="text-center py-12 text-dark-400 bg-dark-900 rounded-xl">
            <Hash size={48} className="mx-auto mb-4 opacity-50" />
            <p>No tags yet. Create one to get started!</p>
            <p className="text-sm mt-2">
              Default tags will be available until you create custom ones.
            </p>
          </div>
        )}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden lg:block bg-dark-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Tag
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Telugu Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Posts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-dark-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {tags.map((tag) => (
              <tr key={tag.id} className="hover:bg-dark-800/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${tag.color}30`, color: tag.color }}
                    >
                      <Hash size={16} />
                    </span>
                    <div>
                      <div className="font-medium">{tag.name}</div>
                      {tag.description && (
                        <div className="text-sm text-dark-400 truncate max-w-xs">
                          {tag.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                  {tag.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-300">
                  {tag.nameTelugu || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {tag.postCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(tag)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      tag.isActive
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    {tag.isActive ? (
                      <>
                        <ToggleRight size={14} />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={14} />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(tag)}
                    className="text-primary-400 hover:text-primary-300 mr-3"
                    title="Edit tag"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(tag)}
                    className="text-red-400 hover:text-red-300"
                    disabled={tag.postCount > 0}
                    title={
                      tag.postCount > 0
                        ? 'Cannot delete tag with posts'
                        : 'Delete tag'
                    }
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tags.length === 0 && (
          <div className="text-center py-12 text-dark-400">
            <Hash size={48} className="mx-auto mb-4 opacity-50" />
            <p>No tags yet. Create one to get started!</p>
            <p className="text-sm mt-2">
              Default tags will be available until you create custom ones.
            </p>
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
                {editingTag ? 'Edit Tag' : 'Create Tag'}
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
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: value,
                      slug: !editingTag ? generateSlug(value) : prev.slug,
                    }));
                  }}
                  className="input"
                  required
                  placeholder="e.g., Sexual Confession"
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
                  placeholder="sexual-confession"
                  title="Only lowercase letters, numbers, and hyphens"
                />
                <p className="text-dark-500 text-xs mt-1 break-all">
                  Used in URLs: /feed/tag/{formData.slug || 'your-tag-slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Name (Telugu)
                </label>
                <input
                  type="text"
                  value={formData.nameTelugu}
                  onChange={(e) => setFormData({ ...formData, nameTelugu: e.target.value })}
                  className="input"
                  placeholder="Telugu translation (optional)"
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
                  placeholder="Brief description of this tag (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-12 sm:h-10 rounded cursor-pointer border-0 flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input flex-1"
                    placeholder="#6366f1"
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
                  {editingTag ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
