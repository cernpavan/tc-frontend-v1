import { useState, useCallback, useRef, useEffect } from 'react';
import { apiGet } from '@services/api';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UsePaginationOptions<T> {
  endpoint: string;
  itemsPerPage?: number;
  transformData?: (posts: any[]) => T[];
  onError?: (error: Error) => void;
}

interface UsePaginationResult<T> {
  items: T[];
  pagination: PaginationData | null;
  currentPage: number;
  isLoading: boolean;
  isPreloading: boolean;
  isStale: boolean;
  error: string | null;
  goToPage: (page: number) => void;
  refresh: () => void;
}

// LRU Cache implementation for better memory management
class LRUCache {
  private maxSize: number;
  private cache = new Map<string, { data: any[]; timestamp: number; lastAccessed: number }>();

  constructor(maxSize = 50) {
    this.maxSize = maxSize;
  }

  get(key: string): any[] | null {
    const item = this.cache.get(key);
    if (!item || Date.now() - item.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    // Update last accessed time for LRU
    item.lastAccessed = Date.now();
    return item.data;
  }

  set(key: string, data: any[]): void {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently accessed entry
      let lruKey = '';
      let lruTime = Infinity;
      for (const [k, v] of this.cache) {
        if (v.lastAccessed < lruTime) {
          lruTime = v.lastAccessed;
          lruKey = k;
        }
      }
      if (lruKey) this.cache.delete(lruKey);
    }
    this.cache.set(key, { data, timestamp: Date.now(), lastAccessed: Date.now() });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Use LRU cache with larger capacity
const pageCache = new LRUCache(50);
const CACHE_TTL = 60000; // 1 minute cache

function getCacheKey(endpoint: string, page: number): string {
  return `${endpoint}:${page}`;
}

function getFromCache(key: string): any[] | null {
  return pageCache.get(key);
}

function setCache(key: string, data: any[]): void {
  pageCache.set(key, data);
}

export function usePagination<T = any>({
  endpoint,
  itemsPerPage = 15,
  transformData,
  onError,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreloading, setIsPreloading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const preloadAbortRef = useRef<AbortController | null>(null);
  const previousEndpointRef = useRef<string>(endpoint);

  // Fetch a specific page
  const fetchPage = useCallback(
    async (page: number, isPreload: boolean = false) => {
      const cacheKey = getCacheKey(endpoint, page);

      // Check cache first
      if (!isPreload) {
        const cached = getFromCache(cacheKey);
        if (cached) {
          const transformed = transformData ? transformData(cached) : cached as T[];
          setItems(transformed);
          return;
        }
      }

      // Cancel previous request
      if (!isPreload && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (isPreload && preloadAbortRef.current) {
        preloadAbortRef.current.abort();
      }

      const controller = new AbortController();
      if (isPreload) {
        preloadAbortRef.current = controller;
      } else {
        abortControllerRef.current = controller;
      }

      try {
        if (!isPreload) {
          // Only show loading state if we don't have stale data to show
          if (items.length === 0) {
            setIsLoading(true);
          }
          setError(null);
        } else {
          setIsPreloading(true);
        }

        // Build URL with page parameter
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = `${endpoint}${separator}page=${page}&limit=${itemsPerPage}`;

        const response = await apiGet<{
          posts: any[];
          pagination?: PaginationData;
        }>(url);

        // Cache the raw data
        setCache(cacheKey, response.posts);

        if (!isPreload) {
          const transformed = transformData
            ? transformData(response.posts)
            : (response.posts as T[]);
          setItems(transformed);
          setIsStale(false); // Data is now fresh

          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;

        if (!isPreload) {
          const errorMessage = err.message || 'Failed to load posts';
          setError(errorMessage);
          onError?.(err);
        }
      } finally {
        if (!isPreload) {
          setIsLoading(false);
        } else {
          setIsPreloading(false);
        }
      }
    },
    [endpoint, itemsPerPage, transformData, onError]
  );

  // Preload adjacent page
  const preloadAdjacentPage = useCallback(
    (currentPage: number, totalPages: number) => {
      // Only preload if there's a next page
      if (currentPage < totalPages) {
        const nextPage = currentPage + 1;
        const cacheKey = getCacheKey(endpoint, nextPage);

        // Skip if already cached
        if (!getFromCache(cacheKey)) {
          // Use requestIdleCallback for better performance, fallback to short timeout
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(
              () => fetchPage(nextPage, true),
              { timeout: 1000 }
            );
          } else {
            setTimeout(() => fetchPage(nextPage, true), 100);
          }
        }
      }
    },
    [endpoint, fetchPage]
  );

  // Go to a specific page
  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || (pagination && page > pagination.pages)) return;
      if (page === currentPage) return;

      setCurrentPage(page);

      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [currentPage, pagination]
  );

  // Refresh current page
  const refresh = useCallback(() => {
    // Clear cache for current page
    const cacheKey = getCacheKey(endpoint, currentPage);
    pageCache.delete(cacheKey);

    fetchPage(currentPage);
  }, [endpoint, currentPage, fetchPage]);

  // Fetch when page or endpoint changes
  useEffect(() => {
    fetchPage(currentPage);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [currentPage, endpoint, fetchPage]);

  // Preload next page after current page loads
  useEffect(() => {
    if (!isLoading && pagination && pagination.pages > 1) {
      preloadAdjacentPage(currentPage, pagination.pages);
    }
  }, [isLoading, currentPage, pagination, preloadAdjacentPage]);

  // Reset to page 1 when endpoint changes - STALE-WHILE-REVALIDATE pattern
  useEffect(() => {
    // Only reset if endpoint actually changed
    if (previousEndpointRef.current !== endpoint) {
      previousEndpointRef.current = endpoint;
      setCurrentPage(1);
      // DON'T clear items - keep showing old data while new data loads
      // This prevents the flash of empty state
      setIsStale(true); // Mark current data as stale
      // Pagination will be updated when new data arrives
    }
  }, [endpoint]);

  return {
    items,
    pagination,
    currentPage,
    isLoading,
    isPreloading,
    isStale,
    error,
    goToPage,
    refresh,
  };
}

// Clear all cache (useful when user logs out or data changes)
export function clearPaginationCache(): void {
  pageCache.clear();
}
