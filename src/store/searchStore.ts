import { create } from 'zustand';
import { Post } from '../types';

export interface SearchResult extends Post {
  snippet?: string;
  relevanceScore?: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'tag' | 'content';
}

interface SearchState {
  // State
  query: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  error: string | null;
  isOpen: boolean;
  recentSearches: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Actions
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[], pagination: SearchState['pagination']) => void;
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingSuggestions: (loading: boolean) => void;
  setError: (error: string | null) => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  clearSearch: () => void;
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  loadMore: () => void;
}

// Get recent searches from localStorage
const getStoredRecentSearches = (): string[] => {
  try {
    const stored = localStorage.getItem('recent-searches');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save recent searches to localStorage
const saveRecentSearches = (searches: string[]) => {
  try {
    localStorage.setItem('recent-searches', JSON.stringify(searches.slice(0, 10)));
  } catch {
    // Ignore localStorage errors
  }
};

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  query: '',
  results: [],
  suggestions: [],
  isLoading: false,
  isLoadingSuggestions: false,
  error: null,
  isOpen: false,
  recentSearches: getStoredRecentSearches(),
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },

  // Actions
  setQuery: (query) => set({ query }),

  setResults: (results, pagination) =>
    set((state) => ({
      results: pagination.page === 1 ? results : [...state.results, ...results],
      pagination,
      isLoading: false,
      error: null,
    })),

  setSuggestions: (suggestions) =>
    set({
      suggestions,
      isLoadingSuggestions: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setLoadingSuggestions: (isLoadingSuggestions) => set({ isLoadingSuggestions }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
      isLoadingSuggestions: false,
    }),

  openSearch: () => set({ isOpen: true }),

  closeSearch: () =>
    set({
      isOpen: false,
      suggestions: [],
    }),

  toggleSearch: () => set((state) => ({ isOpen: !state.isOpen })),

  clearSearch: () =>
    set({
      query: '',
      results: [],
      suggestions: [],
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
    }),

  addRecentSearch: (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    set((state) => {
      const filtered = state.recentSearches.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [trimmed, ...filtered].slice(0, 10);
      saveRecentSearches(updated);
      return { recentSearches: updated };
    });
  },

  removeRecentSearch: (query) => {
    set((state) => {
      const updated = state.recentSearches.filter((s) => s !== query);
      saveRecentSearches(updated);
      return { recentSearches: updated };
    });
  },

  clearRecentSearches: () => {
    saveRecentSearches([]);
    set({ recentSearches: [] });
  },

  loadMore: () => {
    const { pagination } = get();
    if (pagination.page < pagination.pages) {
      set((state) => ({
        pagination: {
          ...state.pagination,
          page: state.pagination.page + 1,
        },
      }));
    }
  },
}));
