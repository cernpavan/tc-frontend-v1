import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Plus, Flame, Menu, LucideIcon } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import clsx from 'clsx';
import CommunityModal from './CommunityModal';

interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  labelTe: string;
  requiresAuth?: boolean;
  isButton?: boolean;
  isCenter?: boolean;
  isKamakadhu?: boolean;
  onClick?: () => void;
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const currentLanguage = isAuthenticated ? user?.language : (localStorage.getItem('guest-language') || 'english');
  const isTeluguLang = currentLanguage === 'telugu';
  const [showCommunityModal, setShowCommunityModal] = useState(false);

  const handleMenuClick = () => {
    window.dispatchEvent(new CustomEvent('toggleMobileSidebar'));
  };

  const handleCommunityClick = () => {
    setShowCommunityModal(true);
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      openAuthModal(() => navigate('/create'));
    } else {
      navigate('/create');
    }
  };

  const handleKamakadhuClick = () => {
    navigate('/kamakadhu');
  };

  const navItems: NavItem[] = [
    {
      path: '/feed',
      icon: Home,
      label: 'Home',
      labelTe: 'హోమ్',
    },
    {
      path: '#community',
      icon: Users,
      label: 'Community',
      labelTe: 'కమ్యూనిటీ',
      isButton: true,
      onClick: handleCommunityClick,
    },
    {
      path: '/create',
      icon: Plus,
      label: 'Add',
      labelTe: 'జోడించు',
      isCenter: true,
      requiresAuth: true,
      onClick: handleCreateClick,
    },
    {
      path: '/kamakadhu',
      icon: Flame,
      label: 'Kamakadhu',
      labelTe: 'కామకథలు',
      isKamakadhu: true,
      onClick: handleKamakadhuClick,
    },
  ];

  // Don't show on auth pages or landing
  if (location.pathname === '/' ||
      location.pathname.startsWith('/auth') ||
      location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/register') ||
      location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <nav
        className="bottom-nav overflow-x-hidden md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto overflow-x-hidden relative">
          {navItems.map((item) => {
            const isActive = !item.isButton && !item.isCenter && (
              location.pathname === item.path ||
              (item.path === '/feed' && location.pathname.startsWith('/feed') && !location.pathname.includes('/search')) ||
              (item.path === '#community' && location.pathname.startsWith('/community')) ||
              (item.path === '/kamakadhu' && location.pathname.startsWith('/kamakadhu'))
            );

            const handleClick = (e: React.MouseEvent) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
                return;
              }
              if (item.requiresAuth && !isAuthenticated) {
                e.preventDefault();
                openAuthModal(() => navigate(item.path));
              }
            };

            // Render center button (Add Confession) with special styling
            if (item.isCenter) {
              return (
                <button
                  key={item.path}
                  onClick={handleClick}
                  className={clsx(
                    'flex flex-col items-center justify-center w-16 h-full',
                    'transition-all duration-200',
                    'touch-target'
                  )}
                  aria-label={isTeluguLang ? item.labelTe : item.label}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md shadow-primary-500/25">
                    <item.icon size={20} strokeWidth={2.5} />
                  </div>
                  <span className={clsx(
                    'text-[10px] mt-1 font-medium text-primary-400',
                    isTeluguLang && 'font-telugu'
                  )}>
                    {isTeluguLang ? item.labelTe : item.label}
                  </span>
                </button>
              );
            }

            // Render Kamakadhu with special accent styling
            if (item.isKamakadhu) {
              const isKamakadhuActive = location.pathname.startsWith('/kamakadhu');
              return (
                <button
                  key={item.path}
                  onClick={handleClick}
                  className={clsx(
                    'flex flex-col items-center justify-center w-16 h-full',
                    'transition-colors duration-200 touch-target',
                    isKamakadhuActive
                      ? 'text-orange-400'
                      : 'text-dark-400 hover:text-orange-400'
                  )}
                  aria-label={isTeluguLang ? item.labelTe : item.label}
                >
                  <item.icon
                    size={24}
                    className={clsx(
                      'transition-transform duration-200',
                      isKamakadhuActive && 'scale-110'
                    )}
                  />
                  <span className={clsx(
                    'text-[10px] mt-1 font-medium',
                    isTeluguLang && 'font-telugu'
                  )}>
                    {isTeluguLang ? item.labelTe : item.label}
                  </span>
                </button>
              );
            }

            // Render as button for Community
            if (item.isButton) {
              const isCommunityActive = location.pathname.startsWith('/community');
              return (
                <button
                  key={item.path}
                  onClick={handleClick}
                  className={clsx(
                    'flex flex-col items-center justify-center w-16 h-full',
                    'transition-colors duration-200 touch-target',
                    isCommunityActive ? 'text-primary-400' : 'text-dark-400 hover:text-dark-300'
                  )}
                  aria-label={isTeluguLang ? item.labelTe : item.label}
                >
                  <item.icon
                    size={24}
                    className={clsx(
                      'transition-transform duration-200',
                      isCommunityActive && 'scale-110'
                    )}
                  />
                  <span className={clsx(
                    'text-[10px] mt-1 font-medium',
                    isTeluguLang && 'font-telugu'
                  )}>
                    {isTeluguLang ? item.labelTe : item.label}
                  </span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleClick}
                className={clsx(
                  'flex flex-col items-center justify-center w-16 h-full',
                  'transition-colors duration-200 touch-target',
                  isActive ? 'text-primary-400' : 'text-dark-400 hover:text-dark-300'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon
                  size={24}
                  className={clsx(
                    'transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
                <span className={clsx(
                  'text-[10px] mt-1 font-medium',
                  isTeluguLang && 'font-telugu'
                )}>
                  {isTeluguLang ? item.labelTe : item.label}
                </span>
              </NavLink>
            );
          })}

          {/* Menu button for sidebar access */}
          <button
            onClick={handleMenuClick}
            className="flex flex-col items-center justify-center w-16 h-full text-dark-400 hover:text-dark-300 transition-colors duration-200 touch-target"
            aria-label={isTeluguLang ? 'మెనూ తెరవండి' : 'Open menu'}
          >
            <Menu size={24} />
            <span className={clsx(
              'text-[10px] mt-1 font-medium',
              isTeluguLang && 'font-telugu'
            )}>
              {isTeluguLang ? 'మెనూ' : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* Community Selection Modal */}
      <CommunityModal
        isOpen={showCommunityModal}
        onClose={() => setShowCommunityModal(false)}
      />
    </>
  );
}
