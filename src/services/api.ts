import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Extend axios config to include metadata for performance tracking
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}

// Create axios instance with timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout - prevents hanging requests
});

// Request interceptor - add auth token and performance tracking
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add timing metadata for performance monitoring
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and log slow requests
api.interceptors.response.use(
  (response) => {
    // Log slow API calls in development
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
    if (duration > 2000 && import.meta.env.DEV) {
      console.warn(`[SLOW API] ${response.config.url} took ${duration}ms`);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    // Handle timeout errors gracefully
    if (error.code === 'ECONNABORTED') {
      console.error('[API TIMEOUT] Request timed out:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

// API helper functions
export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.get<{ success: boolean; data: T }>(url, config);
  return response.data.data;
};

export const apiPost = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.post<{ success: boolean; data: T }>(url, data, config);
  return response.data.data;
};

export const apiPut = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.put<{ success: boolean; data: T }>(url, data, config);
  return response.data.data;
};

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.delete<{ success: boolean; data: T }>(url, config);
  return response.data.data;
};

export default api;
