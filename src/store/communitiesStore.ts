import { create } from 'zustand';
import { apiGet } from '@services/api';
import { Community } from '../types';

interface CommunitiesState {
  communities: Community[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchCommunities: () => Promise<void>;
}

export const useCommunitiesStore = create<CommunitiesState>((set, get) => ({
  communities: [],
  isLoaded: false,
  isLoading: false,
  error: null,

  fetchCommunities: async () => {
    // Skip if already loaded or currently loading
    if (get().isLoaded || get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const response = await apiGet<{ communities: Community[] }>('/communities');
      set({
        communities: response.communities,
        isLoaded: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch communities:', error);
      set({
        error: error.message || 'Failed to load communities',
        isLoading: false,
      });
    }
  },
}));
