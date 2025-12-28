import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, Loader2, Search } from 'lucide-react';
import { apiGet } from '@services/api';
import { Community } from '../../types';
import { useAuthStore } from '@store/authStore';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommunityModal({ isOpen, onClose }: CommunityModalProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const currentLanguage = isAuthenticated ? user?.language : (localStorage.getItem('guest-language') || 'english');
  const isTeluguLang = currentLanguage === 'telugu';

  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCommunities();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = communities.filter((community) =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (community.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCommunities(filtered);
    } else {
      setFilteredCommunities(communities);
    }
  }, [searchQuery, communities]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await apiGet<{ communities: Community[] }>('/communities');
      setCommunities(response.communities);
      setFilteredCommunities(response.communities);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommunitySelect = (community: Community) => {
    onClose();
    navigate(`/community/${community.slug}`);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-dark-900 border border-dark-700 rounded-t-2xl md:rounded-2xl w-full max-w-md shadow-2xl animate-in max-h-[80vh] flex flex-col safe-area-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-primary-400" />
            <h2 className="text-xl font-bold">
              {isTeluguLang ? 'కమ్యూనిటీలు' : 'Communities'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-2 hover:bg-dark-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-dark-800 flex-shrink-0">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder={isTeluguLang ? 'కమ్యూనిటీలను వెతకండి...' : 'Search communities...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-primary-400" size={32} />
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-dark-600 mb-4" />
              <p className="text-dark-400">
                {searchQuery
                  ? (isTeluguLang ? 'కమ్యూనిటీలు కనుగొనబడలేదు' : 'No communities found')
                  : (isTeluguLang ? 'కమ్యూనిటీలు అందుబాటులో లేవు' : 'No communities available')
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCommunities.map((community) => (
                <button
                  key={community.id}
                  onClick={() => handleCommunitySelect(community)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-all text-left touch-target"
                  style={{
                    borderLeft: community.color ? `3px solid ${community.color}` : undefined,
                  }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl flex-shrink-0"
                    style={{
                      backgroundColor: community.color ? `${community.color}20` : '#334155',
                    }}
                  >
                    {community.icon || '💬'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-dark-100 truncate">
                      {community.name}
                    </h3>
                    {community.description && (
                      <p className="text-sm text-dark-400 truncate">
                        {community.description}
                      </p>
                    )}
                    <p className="text-xs text-dark-500 mt-1">
                      {community.postCount} {isTeluguLang ? 'పోస్ట్‌లు' : 'posts'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint for swipe gesture */}
        <div className="p-3 border-t border-dark-800 flex-shrink-0">
          <div className="w-10 h-1 bg-dark-600 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
