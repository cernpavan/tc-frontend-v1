import { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Ban,
  Eye,
  EyeOff,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Globe,
  Monitor,
  Calendar,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, AdminUser, Pagination } from '@services/adminApi';
import { useAdminAuthStore } from '@store/adminAuthStore';

export default function Users() {
  const { admin } = useAdminAuthStore();
  const isAdmin = admin?.role === 'admin';
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userStats, setUserStats] = useState<{ postCount: number; commentCount: number; reportCount: number } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [banModal, setBanModal] = useState<{ userId: string; type: 'temp' | 'permanent' } | null>(null);
  const [banDays, setBanDays] = useState(7);
  const [banReason, setBanReason] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers(page, 20);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const data = await adminService.getUserDetails(userId);
      setSelectedUser(data.user);
      setUserStats(data.stats);
    } catch (error) {
      toast.error('Failed to load user details');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleShadowBan = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminService.shadowBanUser(userId);
      toast.success('User shadow banned');
      fetchUsers(pagination?.page);
    } catch (error) {
      toast.error('Failed to shadow ban user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanSubmit = async () => {
    if (!banModal) return;
    if (!banReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    setActionLoading(banModal.userId);
    try {
      if (banModal.type === 'temp') {
        await adminService.tempBanUser(banModal.userId, banDays, banReason);
        toast.success(`User banned for ${banDays} days`);
      } else {
        await adminService.permanentBanUser(banModal.userId, banReason);
        toast.success('User permanently banned');
      }
      setBanModal(null);
      setBanReason('');
      setBanDays(7);
      fetchUsers(pagination?.page);
    } catch (error) {
      toast.error('Failed to ban user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminService.unbanUser(userId);
      toast.success('User unbanned');
      fetchUsers(pagination?.page);
    } catch (error) {
      toast.error('Failed to unban user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted permanently');
      setDeleteConfirmId(null);
      fetchUsers(pagination?.page);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-dark-400 mt-1">Manage platform users</p>
        </div>
        <div className="text-sm text-dark-400">Total: {pagination?.total || 0} users</div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
        <input
          type="text"
          placeholder="Search by username..."
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

      {/* Users Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-dark-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-dark-800/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <span className="text-primary-400 font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        {user.email && (
                          <p className="text-xs text-dark-500">{user.email}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {user.isBanned ? (
                        <span className="inline-flex px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full w-fit">
                          Banned
                        </span>
                      ) : user.isShadowBanned ? (
                        <span className="inline-flex px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full w-fit">
                          Shadow Banned
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full w-fit">
                          Active
                        </span>
                      )}
                      {user.banReason && (
                        <span className="text-xs text-dark-500">{user.banReason}</span>
                      )}
                      {user.banExpiry && (
                        <span className="text-xs text-dark-500">
                          Until: {new Date(user.banExpiry).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-400">
                    {user.deviceInfo?.[0]?.country || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => fetchUserDetails(user.id)}
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {!user.isBanned && !user.isShadowBanned && (
                        <>
                          <button
                            onClick={() => handleShadowBan(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-2 text-dark-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Shadow Ban"
                          >
                            <EyeOff size={16} />
                          </button>
                          <button
                            onClick={() => setBanModal({ userId: user.id, type: 'temp' })}
                            disabled={actionLoading === user.id}
                            className="p-2 text-dark-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                            title="Temp Ban"
                          >
                            <Ban size={16} />
                          </button>
                        </>
                      )}
                      {(user.isBanned || user.isShadowBanned) && (
                        <button
                          onClick={() => handleUnban(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-2 text-dark-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Unban"
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteConfirmId(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete User (Permanent)"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No users found</p>
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
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 text-dark-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 text-dark-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">User Details</h2>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setUserStats(null);
                }}
                className="p-2 text-dark-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <span className="text-primary-400 font-bold text-2xl">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedUser.username}</h3>
                  <p className="text-dark-400">{selectedUser.email || 'No email'}</p>
                </div>
              </div>

              {/* Stats */}
              {userStats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-dark-800 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{userStats.postCount}</p>
                    <p className="text-sm text-dark-400">Posts</p>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{userStats.commentCount}</p>
                    <p className="text-sm text-dark-400">Comments</p>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{userStats.reportCount}</p>
                    <p className="text-sm text-dark-400">Reports</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="bg-dark-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-dark-400 mb-2">Account Status</h4>
                <div className="space-y-2">
                  {selectedUser.isBanned ? (
                    <div className="flex items-center justify-between">
                      <span className="text-red-400">Banned</span>
                      {selectedUser.banExpiry && (
                        <span className="text-dark-400 text-sm">
                          Until: {new Date(selectedUser.banExpiry).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : selectedUser.isShadowBanned ? (
                    <span className="text-amber-400">Shadow Banned</span>
                  ) : (
                    <span className="text-green-400">Active</span>
                  )}
                  {selectedUser.banReason && (
                    <p className="text-sm text-dark-400">Reason: {selectedUser.banReason}</p>
                  )}
                </div>
              </div>

              {/* Device Info */}
              {selectedUser.deviceInfo && selectedUser.deviceInfo.length > 0 && (
                <div className="bg-dark-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-dark-400 mb-3">Device Information</h4>
                  <div className="space-y-3">
                    {selectedUser.deviceInfo.slice(0, 3).map((device, index) => (
                      <div key={index} className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-dark-300">
                          <Globe size={14} />
                          {device.country || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-2 text-dark-300">
                          <Monitor size={14} />
                          {device.browser} / {device.os}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created */}
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <Calendar size={14} />
                Joined: {new Date(selectedUser.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-dark-800 flex justify-end gap-3">
              {!selectedUser.isBanned && !selectedUser.isShadowBanned && (
                <>
                  <button
                    onClick={() => {
                      handleShadowBan(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
                  >
                    Shadow Ban
                  </button>
                  <button
                    onClick={() => {
                      setBanModal({ userId: selectedUser.id, type: 'temp' });
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                  >
                    Temp Ban
                  </button>
                  <button
                    onClick={() => {
                      setBanModal({ userId: selectedUser.id, type: 'permanent' });
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Permanent Ban
                  </button>
                </>
              )}
              {(selectedUser.isBanned || selectedUser.isShadowBanned) && (
                <button
                  onClick={() => {
                    handleUnban(selectedUser.id);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                >
                  Unban User
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => {
                    setDeleteConfirmId(selectedUser.id);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete User
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-dark-800">
              <h2 className="text-lg font-semibold text-white">
                {banModal.type === 'temp' ? 'Temporary Ban' : 'Permanent Ban'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {banModal.type === 'temp' && (
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">
                    Ban Duration (days)
                  </label>
                  <input
                    type="number"
                    value={banDays}
                    onChange={(e) => setBanDays(parseInt(e.target.value) || 1)}
                    min={1}
                    max={365}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Reason
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Enter ban reason..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-dark-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setBanModal(null);
                  setBanReason('');
                  setBanDays(7);
                }}
                className="px-4 py-2 bg-dark-800 text-dark-300 rounded-lg hover:bg-dark-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBanSubmit}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Admin Only) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-dark-800">
              <h2 className="text-lg font-semibold text-white">Delete User Account</h2>
            </div>
            <div className="p-6">
              <p className="text-dark-300 mb-4">
                Are you sure you want to permanently delete this user account? This action cannot be undone.
              </p>
              <p className="text-red-400 text-sm">
                Warning: All user data including posts, comments, and reactions will be permanently deleted.
              </p>
            </div>
            <div className="p-6 border-t border-dark-800 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-dark-800 text-dark-300 rounded-lg hover:bg-dark-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmId)}
                disabled={actionLoading !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
