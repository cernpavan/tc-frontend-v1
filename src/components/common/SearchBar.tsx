import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, Tag, FileText, Loader2 } from 'lucide-react';
import { useSearchStore, SearchSuggestion } from '@store/searchStore';
import { apiGet } from '@services/api';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface SearchBarProps {
  compact?: boolean;
}

export default function SearchBar({ compact = false }: SearchBarProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    isLoadingSuggestions,
    setLoadingSuggestions,
    isOpen,
    openSearch,
    closeSearch,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useSearchStore();

  const [localQuery, setLocalQuery] = useState(query);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(localQuery, 300);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await apiGet<{ suggestions: SearchSuggestion[] }>(
          `/feed/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`
        );
        setSuggestions(response.suggestions || []);
      } catch (error) {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, setSuggestions, setLoadingSuggestions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        if (!localQuery.trim()) {
          closeSearch();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeSearch, localQuery]);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = [
        ...suggestions.map((s) => s.text),
        ...(suggestions.length === 0 && localQuery.trim().length < 2 ? recentSearches : []),
      ];

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && items[selectedIndex]) {
            handleSearch(items[selectedIndex]);
          } else if (localQuery.trim().length >= 2) {
            handleSearch(localQuery.trim());
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowDropdown(false);
          inputRef.current?.blur();
          if (!localQuery.trim()) {
            closeSearch();
          }
          break;
      }
    },
    [suggestions, recentSearches, selectedIndex, localQuery, closeSearch]
  );

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim().length < 2) return;

    addRecentSearch(searchQuery);
    setQuery(searchQuery);
    setLocalQuery(searchQuery);
    setShowDropdown(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    setSelectedIndex(-1);
    setShowDropdown(true);
  };

  const handleFocus = () => {
    openSearch();
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setLocalQuery('');
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const getTagLabel = (tag: string): string => {
    const labels: Record<string, string> = {
      'sexual-confession': 'Sexual Confession',
      'fantasy-kinks': 'Fantasy & Kinks',
      'relationship-affair': 'Relationship/Affair',
      'guilt-regret': 'Guilt & Regret',
      cheating: 'Cheating',
      'one-night-story': 'One Night Story',
      'adult-advice': 'Adult Advice',
      'dark-thoughts': 'Dark Thoughts',
      'curiosity-question': 'Curiosity/Question',
    };
    return labels[tag] || tag.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const showRecentSearches =
    showDropdown && localQuery.trim().length < 2 && recentSearches.length > 0;
  const showSuggestions = showDropdown && localQuery.trim().length >= 2;

  return (
    <div ref={containerRef} className={`relative flex-1 overflow-hidden ${compact ? 'max-w-full' : 'w-full'}`}>
      {/* Search Input */}
      <div className="relative">
        <Search
          className={`absolute top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none ${compact ? 'left-2.5' : 'left-3.5'}`}
          size={compact ? 14 : 16}
        />
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={compact ? "Search..." : "Search confessions..."}
          className={`w-full bg-dark-800/80 border border-dark-700/80 rounded-full text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary-500/70 focus:ring-1 focus:ring-primary-500/30 focus:bg-dark-800 transition-all ${
            compact
              ? 'pl-7 pr-7 py-1.5 text-xs'
              : 'pl-9 pr-9 py-[7px] text-[13px]'
          }`}
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className={`absolute top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors ${
              compact ? 'right-2' : 'right-3.5'
            }`}
          >
            <X size={compact ? 12 : 14} />
          </button>
        )}
        {isLoadingSuggestions && !compact && (
          <Loader2
            className="absolute right-9 top-1/2 -translate-y-1/2 text-dark-400 animate-spin"
            size={14}
          />
        )}
      </div>

      {/* Dropdown */}
      {(showRecentSearches || showSuggestions) && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-dark-800 border border-dark-700/80 rounded-xl shadow-xl overflow-hidden z-50 animate-in animate-slide-in-from-top-2">
          {/* Recent Searches */}
          {showRecentSearches && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-xs font-medium text-dark-400 uppercase tracking-wide">
                  Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-dark-400 hover:text-primary-400 transition-colors"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={search}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedIndex === index
                      ? 'bg-dark-700 text-dark-100'
                      : 'hover:bg-dark-700/50 text-dark-300'
                  }`}
                  onClick={() => handleSearch(search)}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-dark-400" />
                    <span className="text-sm">{search}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(search);
                    }}
                    className="text-dark-500 hover:text-dark-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && (
            <div className="p-2">
              {suggestions.length === 0 && !isLoadingSuggestions ? (
                <div className="px-3 py-4 text-center text-dark-400 text-sm">
                  Press Enter to search for "{localQuery}"
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${suggestion.text}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      selectedIndex === index
                        ? 'bg-dark-700 text-dark-100'
                        : 'hover:bg-dark-700/50 text-dark-300'
                    }`}
                    onClick={() =>
                      handleSearch(
                        suggestion.type === 'tag'
                          ? getTagLabel(suggestion.text)
                          : suggestion.text
                      )
                    }
                  >
                    {suggestion.type === 'tag' ? (
                      <Tag size={14} className="text-primary-400" />
                    ) : (
                      <FileText size={14} className="text-accent-400" />
                    )}
                    <span className="text-sm truncate">
                      {suggestion.type === 'tag'
                        ? getTagLabel(suggestion.text)
                        : suggestion.text}
                    </span>
                    <span className="text-xs text-dark-500 ml-auto">
                      {suggestion.type === 'tag' ? 'Tag' : 'Confession'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Search hint */}
          {showSuggestions && localQuery.trim().length >= 2 && (
            <div className="px-4 py-2 border-t border-dark-700 bg-dark-850">
              <button
                onClick={() => handleSearch(localQuery.trim())}
                className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Search size={14} />
                <span>Search for "{localQuery.trim()}"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
