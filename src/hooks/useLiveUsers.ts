import { useState, useEffect, useRef, useCallback } from 'react';

interface LiveUsersConfig {
  min: number;
  max: number;
}

const STORAGE_KEY = 'live-users-config';
const DEFAULT_CONFIG: LiveUsersConfig = {
  min: 500,
  max: 900,
};

// Update interval - reduced frequency to minimize re-renders
const UPDATE_INTERVAL = 8000; // 8 seconds instead of 3-5

export function useLiveUsers() {
  const [userCount, setUserCount] = useState<number>(0);
  const [config, setConfig] = useState<LiveUsersConfig>(DEFAULT_CONFIG);
  const intervalRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  // Load config from localStorage - only once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load live users config:', error);
    }
  }, []);

  // Generate random number within range
  const getRandomCount = useCallback(() => {
    const { min, max } = config;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, [config]);

  // Initialize and update count - optimized to reduce re-renders
  useEffect(() => {
    // Set initial count
    setUserCount(getRandomCount());

    // Only update when page is visible
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Update at fixed interval, but only when visible
    intervalRef.current = window.setInterval(() => {
      if (isVisibleRef.current) {
        setUserCount(getRandomCount());
      }
    }, UPDATE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getRandomCount]);

  // Function to update config (for admin use later)
  const updateConfig = useCallback((newConfig: Partial<LiveUsersConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    userCount,
    config,
    updateConfig,
  };
}
