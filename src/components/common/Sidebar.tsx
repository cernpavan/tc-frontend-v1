import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Flame,
  Clock,
  Heart,
  MessageCircle,
  Moon,
  Tag,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { apiGet } from '@services/api';
import { Community } from '../../types';

const feedLinks = [
  { path: '/feed', icon: Clock, label: 'Latest', labelTe: 'తాజావి' },
  { path: '/feed/trending', icon: Flame, label: 'Trending', labelTe: 'ట్రెండింగ్' },
  { path: '/feed/relatable', icon: Heart, label: 'Most Relatable', labelTe: 'చాలా సంబంధం' },
  { path: '/feed/commented', icon: MessageCircle, label: 'Most Discussed', labelTe: 'ఎక్కువ చర్చ' },
  { path: '/feed/night', icon: Moon, label: 'Night Mode', labelTe: 'రాత్రి మోడ్' },
];

const tags = [
  { id: 'sexual-confession', label: 'Sexual Confession', labelTe: 'లైంగిక ఒప్పుకోలు' },
  { id: 'fantasy-kinks', label: 'Fantasy / Kinks', labelTe: 'ఫాంటసీ' },
  { id: 'relationship-affair', label: 'Relationship', labelTe: 'సంబంధం' },
  { id: 'guilt-regret', label: 'Guilt / Regret', labelTe: 'అపరాధ భావం' },
  { id: 'cheating', label: 'Cheating', labelTe: 'మోసం' },
  { id: 'one-night-story', label: 'One Night', labelTe: 'ఒక రాత్రి' },
  { id: 'adult-advice', label: 'Adult Advice', labelTe: 'సలహా' },
  { id: 'dark-thoughts', label: 'Dark Thoughts', labelTe: 'చీకటి ఆలోచనలు' },
  { id: 'curiosity-question', label: 'Curiosity', labelTe: 'ఆసక్తి' },
];

export default function Sidebar() {
  const { user, isAuthenticated } = useAuthStore();
  const currentLanguage = isAuthenticated ? user?.language : (localStorage.getItem('guest-language') || 'english');
  const isTeluguLang = currentLanguage === 'telugu';
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await apiGet<{ communities: Community[] }>('/communities');
        setCommunities(response.communities);
      } catch (error) {
        console.error('Failed to fetch communities:', error);
      }
    };

    fetchCommunities();
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* Feed Filters */}
      <div>
        <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3 px-3">
          {isTeluguLang ? 'ఫీడ్' : 'Feed'}
        </h3>
        <nav className="space-y-1" role="navigation" aria-label="Feed filters">
          {feedLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/feed'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 shadow-glow-primary/20'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
                }`
              }
            >
              <link.icon size={18} />
              <span className={isTeluguLang ? 'font-telugu' : ''}>
                {isTeluguLang ? link.labelTe : link.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Communities */}
      {communities.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3 px-3 flex items-center gap-2">
            <Users size={14} />
            {isTeluguLang ? 'కమ్యూనిటీలు' : 'Communities'}
          </h3>
          <nav className="space-y-1" role="navigation" aria-label="Communities">
            {communities.map((community) => (
              <NavLink
                key={community.id}
                to={`/community/${community.slug}`}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
                  }`
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{community.icon || '💬'}</span>
                  <span className="text-sm truncate">{community.name}</span>
                </div>
                <span className="text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded-full">
                  {community.postCount}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Tags - Improved Mobile Responsive */}
      <div>
        <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3 px-3 flex items-center gap-2">
          <Tag size={14} />
          {isTeluguLang ? 'ట్యాగ్‌లు' : 'Tags'}
        </h3>
        <div
          className="flex flex-wrap gap-1.5 sm:gap-2 px-1 max-w-full overflow-hidden"
          role="navigation"
          aria-label="Tags"
        >
          {tags.map((tag) => (
            <NavLink
              key={tag.id}
              to={`/feed/tag/${tag.id}`}
              className={({ isActive }) =>
                `inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs rounded-full transition-all duration-200 cursor-pointer min-h-[32px] sm:min-h-[36px] max-w-full truncate ${
                  isActive
                    ? 'bg-primary-600 text-white border-primary-500 hover:bg-primary-500'
                    : 'bg-dark-800 text-dark-300 border border-dark-700 hover:bg-dark-750 hover:text-dark-200 hover:border-dark-600'
                } ${isTeluguLang ? 'font-telugu' : ''}`
              }
            >
              <span className="truncate">{isTeluguLang ? tag.labelTe : tag.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* NSFW Notice */}
      <div className="p-3 bg-accent-900/20 border border-accent-700/30 rounded-xl mx-1">
        <p className={`text-xs text-accent-300 ${isTeluguLang ? 'font-telugu' : ''}`}>
          {isTeluguLang
            ? 'ఈ ప్లాట్‌ఫార్మ్ 18+ పెద్దల కంటెంట్ కలిగి ఉంది.'
            : 'This platform contains 18+ adult content.'}
        </p>
      </div>
    </div>
  );
}
