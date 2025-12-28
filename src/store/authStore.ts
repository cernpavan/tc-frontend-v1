import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  avatar?: string;
  language: 'telugu' | 'english';
  theme: 'light' | 'dark';
  showNsfw: boolean;
  usernameChangesLeft?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  ageVerified: boolean;
  showAuthModal: boolean;
  pendingAction: (() => void) | null;

  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  verifyAge: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLanguage: (language: 'telugu' | 'english') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setShowNsfw: (show: boolean) => void;
  setAvatar: (avatar: string) => void;
  openAuthModal: (pendingAction?: () => void) => void;
  closeAuthModal: () => void;
  executePendingAction: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      ageVerified: false,
      showAuthModal: false,
      pendingAction: null,

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      verifyAge: () =>
        set({
          ageVerified: true,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLanguage: (language) =>
        set((state) => ({
          user: state.user ? { ...state.user, language } : null,
        })),

      setTheme: (theme) =>
        set((state) => ({
          user: state.user ? { ...state.user, theme } : null,
        })),

      setShowNsfw: (showNsfw) =>
        set((state) => ({
          user: state.user ? { ...state.user, showNsfw } : null,
        })),

      setAvatar: (avatar) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatar } : null,
        })),

      openAuthModal: (pendingAction) =>
        set({
          showAuthModal: true,
          pendingAction: pendingAction || null,
        }),

      closeAuthModal: () =>
        set({
          showAuthModal: false,
          pendingAction: null,
        }),

      executePendingAction: () => {
        const { pendingAction, isAuthenticated } = get();
        if (isAuthenticated && pendingAction) {
          pendingAction();
          set({ pendingAction: null });
        }
      },
    }),
    {
      name: 'telugu-confession-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        ageVerified: state.ageVerified,
      }),
    }
  )
);
