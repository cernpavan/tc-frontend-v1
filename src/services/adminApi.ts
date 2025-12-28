import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAdminAuthStore } from '@store/adminAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance for admin
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add admin auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = useAdminAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
adminApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAdminAuthStore.getState().logout();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// API helper functions
export const adminApiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await adminApi.get<{ success: boolean; data: T }>(url, config);
  return response.data.data;
};

export const adminApiPost = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await adminApi.post<{ success: boolean; data: T }>(url, data, config);
  return response.data.data;
};

export const adminApiPut = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await adminApi.put<{ success: boolean; data: T }>(url, data, config);
  return response.data.data;
};

export const adminApiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await adminApi.delete<{ success: boolean; data: T }>(url, config);
  return response.data.data;
};

// Admin API Types
export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  pendingReports: number;
  todayUsers: number;
  todayPosts: number;
}

export interface AdminPost {
  id: string;
  _id?: string; // For backwards compatibility
  content: string;
  title?: string;
  author: { id: string; username: string } | null;
  authorAlias?: string;
  tags: string[];
  nsfwLevel: string;
  mood: string;
  isDeleted: boolean;
  isSoftDeleted: boolean;
  isLocked: boolean;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
}

export interface AdminUser {
  id: string;
  _id?: string; // For backwards compatibility
  username: string;
  email?: string;
  isBanned: boolean;
  isShadowBanned: boolean;
  banReason?: string;
  banExpiry?: string;
  createdAt: string;
  lastIp?: string;
  deviceInfo?: Array<{
    ip: string;
    country: string;
    browser: string;
    os: string;
  }>;
}

export interface AdminReport {
  id: string;
  _id?: string; // For backwards compatibility
  targetType: 'post' | 'comment' | 'user';
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'action-taken' | 'dismissed';
  reporter: { id: string; username: string } | null;
  targetPost?: { id: string; content: string } | null;
  targetComment?: { id: string; content: string } | null;
  targetUser?: { id: string; username: string } | null;
  createdAt: string;
}

export interface SubAdmin {
  id: string;
  _id?: string; // For backwards compatibility
  username: string;
  name: string;
  email: string;
  role: string;
  permissions: Record<string, boolean>;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Admin API Functions
export const adminService = {
  // Auth
  login: (username: string, password: string) =>
    adminApiPost<{ admin: any; token: string }>('/admin/login', { username, password }),

  // Dashboard
  getDashboard: () => adminApiGet<DashboardStats>('/admin/dashboard'),
  getLiveStats: () => adminApiGet<{ recentPosts: AdminPost[]; timestamp: string }>('/admin/dashboard/live'),

  // Posts
  getPosts: (page = 1, limit = 20) =>
    adminApiGet<{ posts: AdminPost[]; pagination: Pagination }>(`/admin/posts?page=${page}&limit=${limit}`),
  softDeletePost: (id: string) => adminApiPost(`/admin/posts/${id}/soft-delete`),
  hardDeletePost: (id: string) => adminApiPost(`/admin/posts/${id}/hard-delete`),
  restorePost: (id: string) => adminApiPost(`/admin/posts/${id}/restore`),
  lockPost: (id: string) => adminApiPost(`/admin/posts/${id}/lock`),

  // Users
  getUsers: (page = 1, limit = 20) =>
    adminApiGet<{ users: AdminUser[]; pagination: Pagination }>(`/admin/users?page=${page}&limit=${limit}`),
  getUserDetails: (id: string) =>
    adminApiGet<{ user: AdminUser; stats: { postCount: number; commentCount: number; reportCount: number } }>(
      `/admin/users/${id}`
    ),
  shadowBanUser: (id: string) => adminApiPost(`/admin/users/${id}/shadow-ban`),
  tempBanUser: (id: string, days: number, reason: string) =>
    adminApiPost(`/admin/users/${id}/temp-ban`, { days, reason }),
  permanentBanUser: (id: string, reason: string) =>
    adminApiPost(`/admin/users/${id}/permanent-ban`, { reason }),
  unbanUser: (id: string) => adminApiPost(`/admin/users/${id}/unban`),
  deleteUser: (id: string) => adminApiDelete(`/admin/users/${id}`), // Admin only - hard delete

  // Reports
  getReports: (status?: string) =>
    adminApiGet<{ reports: AdminReport[] }>(`/admin/reports${status ? `?status=${status}` : ''}`),
  getReportDetails: (id: string) => adminApiGet<{ report: AdminReport }>(`/admin/reports/${id}`),
  takeReportAction: (id: string, action: string) =>
    adminApiPost(`/admin/reports/${id}/action`, { action }),
  dismissReport: (id: string) => adminApiPost(`/admin/reports/${id}/dismiss`),

  // Sub-admins
  getSubAdmins: () => adminApiGet<{ subAdmins: SubAdmin[] }>('/admin/subadmins'),
  createSubAdmin: (data: {
    username: string;
    password: string;
    name: string;
    email: string;
    phone?: string;
    permissions?: Record<string, boolean>;
  }) => adminApiPost<{ subAdmin: SubAdmin }>('/admin/subadmin', data),
  deleteSubAdmin: (id: string) => adminApiDelete(`/admin/subadmin/${id}`),
};

export default adminApi;
