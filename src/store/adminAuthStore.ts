import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'subadmin';
  permissions: {
    canManagePosts?: boolean;
    canManageUsers?: boolean;
    canManageReports?: boolean;
    canManageSubAdmins?: boolean;
    canViewAnalytics?: boolean;
  };
}

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (admin: AdminUser, token: string) => void;
  logout: () => void;
  hasPermission: (permission: keyof AdminUser['permissions']) => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,

      login: (admin, token) =>
        set({
          admin,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
        }),

      hasPermission: (permission) => {
        const { admin } = get();
        if (!admin) return false;
        if (admin.role === 'admin') return true; // Admin has all permissions
        return admin.permissions[permission] === true;
      },
    }),
    {
      name: 'telugu-confession-admin-auth',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
