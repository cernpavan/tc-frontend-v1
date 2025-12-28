import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  UserCog,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  X,
  Shield,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, SubAdmin } from '@services/adminApi';
import { useAdminAuthStore } from '@store/adminAuthStore';

interface CreateSubAdminForm {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
}

const permissionsList = [
  { key: 'canManagePosts', label: 'Manage Posts', description: 'Can moderate and delete posts' },
  { key: 'canManageUsers', label: 'Manage Users', description: 'Can ban and manage users' },
  { key: 'canManageReports', label: 'Manage Reports', description: 'Can review and act on reports' },
  { key: 'canViewAnalytics', label: 'View Analytics', description: 'Can view dashboard analytics' },
];

export default function SubAdmins() {
  const { admin } = useAdminAuthStore();
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSubAdminForm>();

  const fetchSubAdmins = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSubAdmins();
      setSubAdmins(data.subAdmins);
    } catch (error) {
      toast.error('Failed to load sub-admins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const handleCreate = async (data: CreateSubAdminForm) => {
    setActionLoading('create');
    try {
      await adminService.createSubAdmin({
        ...data,
        permissions,
      });
      toast.success('Sub-admin created successfully');
      setShowCreateModal(false);
      reset();
      setPermissions({});
      fetchSubAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create sub-admin');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sub-admin?')) return;
    setActionLoading(id);
    try {
      await adminService.deleteSubAdmin(id);
      toast.success('Sub-admin deleted');
      fetchSubAdmins();
    } catch (error) {
      toast.error('Failed to delete sub-admin');
    } finally {
      setActionLoading(null);
    }
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Only admin can manage sub-admins
  if (admin?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="w-12 h-12 text-dark-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
        <p className="text-dark-400">Only admins can manage sub-admins</p>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Sub-Admin Management</h1>
          <p className="text-dark-400 mt-1">Create and manage sub-administrators</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Sub-Admin
        </button>
      </div>

      {/* Sub-Admins Grid */}
      {subAdmins.length === 0 ? (
        <div className="bg-dark-900 border border-dark-800 rounded-xl p-12 text-center">
          <UserCog className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400 mb-4">No sub-admins yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Create First Sub-Admin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subAdmins.map((subAdmin) => (
            <div
              key={subAdmin.id}
              className="bg-dark-900 border border-dark-800 rounded-xl p-6 hover:border-dark-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 font-semibold text-lg">
                      {subAdmin.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{subAdmin.name}</h3>
                    <p className="text-sm text-dark-400">@{subAdmin.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(subAdmin.id)}
                  disabled={actionLoading === subAdmin.id}
                  className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-dark-400">{subAdmin.email}</p>
                {subAdmin.lastLogin && (
                  <div className="flex items-center gap-1 text-xs text-dark-500">
                    <Clock size={12} />
                    Last login: {new Date(subAdmin.lastLogin).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Permissions */}
              <div className="border-t border-dark-800 pt-4">
                <p className="text-xs text-dark-500 mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(subAdmin.permissions || {})
                    .filter(([, value]) => value)
                    .map(([key]) => (
                      <span
                        key={key}
                        className="px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded"
                      >
                        {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    ))}
                  {Object.entries(subAdmin.permissions || {}).filter(([, value]) => value).length === 0 && (
                    <span className="text-xs text-dark-500">No special permissions</span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 pt-4 border-t border-dark-800 flex items-center justify-between">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    subAdmin.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {subAdmin.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-dark-500">
                  Created: {new Date(subAdmin.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Create Sub-Admin</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  reset();
                  setPermissions({});
                }}
                className="p-2 text-dark-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleCreate)} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter full name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter username"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Min 3 characters' },
                    maxLength: { value: 20, message: 'Max 20 characters' },
                  })}
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12"
                    placeholder="Enter password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Min 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Phone (optional) */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Phone <span className="text-dark-500">(optional)</span>
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter phone number"
                  {...register('phone')}
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">
                  Permissions
                </label>
                <div className="space-y-2">
                  {permissionsList.map((perm) => (
                    <button
                      key={perm.key}
                      type="button"
                      onClick={() => togglePermission(perm.key)}
                      className={`w-full px-4 py-3 text-left rounded-lg transition-colors ${
                        permissions[perm.key]
                          ? 'bg-primary-500/20 border border-primary-500/50'
                          : 'bg-dark-800 border border-dark-700 hover:border-dark-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              permissions[perm.key] ? 'text-primary-400' : 'text-white'
                            }`}
                          >
                            {perm.label}
                          </p>
                          <p className="text-xs text-dark-500">{perm.description}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            permissions[perm.key]
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-dark-600'
                          }`}
                        >
                          {permissions[perm.key] && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    reset();
                    setPermissions({});
                  }}
                  className="px-4 py-2 bg-dark-800 text-dark-300 rounded-lg hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'create'}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === 'create' ? 'Creating...' : 'Create Sub-Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
