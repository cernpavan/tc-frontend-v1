import { useState, useEffect } from 'react';

interface LiveUsersConfig {
  min: number;
  max: number;
}

const STORAGE_KEY = 'live-users-config';
const DEFAULT_CONFIG: LiveUsersConfig = {
  min: 500,
  max: 900,
};

export function useLiveUsers() {
  const [userCount, setUserCount] = useState<number>(0);
  const [config, setConfig] = useState<LiveUsersConfig>(DEFAULT_CONFIG);

  // Load config from localStorage
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
  const getRandomCount = () => {
    const { min, max } = config;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Initialize and update count
  useEffect(() => {
    // Set initial count
    setUserCount(getRandomCount());

    // Update count at random intervals (3-5 seconds)
    const updateCount = () => {
      setUserCount(getRandomCount());

      // Schedule next update with random interval
      const nextInterval = 3000 + Math.random() * 2000; // 3-5 seconds
      setTimeout(updateCount, nextInterval);
    };

    const firstInterval = 3000 + Math.random() * 2000;
    const timeoutId = setTimeout(updateCount, firstInterval);

    return () => clearTimeout(timeoutId);
  }, [config]);

  // Function to update config (for admin use later)
  const updateConfig = (newConfig: Partial<LiveUsersConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    userCount,
    config,
    updateConfig,
  };
}
