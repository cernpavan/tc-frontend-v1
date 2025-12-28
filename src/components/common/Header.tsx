import { Link, useNavigate } from 'react-router-dom';
import { User, UserCircle, Languages, Plus, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';
import SearchBar from './SearchBar';
import { useLiveUsers } from '@hooks/useLiveUsers';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setLanguage, openAuthModal, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileAvatarMenu, setShowMobileAvatarMenu] = useState(false);
  const { userCount } = useLiveUsers();

  const handleCreatePost = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openAuthModal(() => navigate('/create'));
    }
  };

  const handleSignOut = () => {
    setShowMenu(false);
    logout();
    toast.success('Signed out successfully');
    navigate('/feed');
  };

  const toggleLanguage = () => {
    if (!isAuthenticated) {
      // For guests, just store in localStorage
      const currentLang = localStorage.getItem('guest-language') || 'english';
      const newLanguage = currentLang === 'english' ? 'telugu' : 'english';
      localStorage.setItem('guest-language', newLanguage);
    } else {
      const newLanguage = user?.language === 'english' ? 'telugu' : 'english';
      setLanguage(newLanguage);
    }
  };

  const currentLanguage = isAuthenticated ? user?.language : (localStorage.getItem('guest-language') || 'english');

  const handleMobileAvatarClick = () => {
    setShowMobileAvatarMenu(!showMobileAvatarMenu);
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-900/98 backdrop-blur-md border-b border-dark-750 shadow-lg">
      {/* Mobile Header - Only visible on mobile (< md breakpoint) */}
      <div className="md:hidden">
        <div className="px-3 h-14 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/feed" className="flex items-center flex-shrink-0">
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              TC
            </span>
          </Link>

          {/* Mobile Search Bar - Compact */}
          <div className="flex-1 mx-2 max-w-[200px]">
            <SearchBar compact />
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="btn-icon-sm bg-transparent text-dark-300 hover:bg-dark-800 hover:text-dark-100 flex items-center gap-0.5 flex-shrink-0"
            title={`Switch to ${currentLanguage === 'english' ? 'Telugu' : 'English'}`}
            aria-label={`Switch to ${currentLanguage === 'english' ? 'Telugu' : 'English'}`}
          >
            <Languages size={16} />
            <span className="text-[10px] font-medium">
              {currentLanguage === 'english' ? 'EN' : 'TE'}
            </span>
          </button>

          {/* Profile Icon - Mobile */}
          <div className="flex-shrink-0">
            <button
              onClick={handleMobileAvatarClick}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-dark-800 border border-dark-700 hover:border-primary-500 hover:bg-dark-700 transition-colors"
              aria-label={isAuthenticated ? 'Profile menu' : 'Sign in'}
            >
              <UserCircle size={20} className="text-dark-300" />
            </button>
          </div>
        </div>

        {/* Mobile Profile Menu Dropdown - Fixed positioned outside header */}
        {showMobileAvatarMenu && (
          <>
            <div
              className="fixed inset-0 z-[100] bg-black/20"
              onClick={() => setShowMobileAvatarMenu(false)}
            />
            <div className="fixed right-3 top-16 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl py-1 z-[101]">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-posts"
                    className="flex items-center gap-2 px-4 py-3 hover:bg-dark-700 transition-colors"
                    onClick={() => setShowMobileAvatarMenu(false)}
                  >
                    <User size={18} />
                    <span>Go to Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowMobileAvatarMenu(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowMobileAvatarMenu(false);
                    openAuthModal();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-primary-400 hover:bg-dark-700 transition-colors"
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Desktop Header - Only visible on desktop (>= md breakpoint) */}
      <div className="hidden md:block">
        <div className="w-full h-[58px] flex items-center">
          {/* Left Section - Logo at extreme left (above sidebar, w-64 matches sidebar width) */}
          <div className="flex items-center flex-shrink-0 w-64 pl-5">
            <Link to="/feed" className="flex items-center">
              <span className="text-[21px] font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent tracking-tight">
                Telugu Confession
              </span>
            </Link>
          </div>

          {/* Rest of header - fills remaining space with balanced layout */}
          <div className="flex-1 flex items-center justify-between pr-5">
            {/* Left group: Live Users */}
            <div className="flex items-center">
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 rounded-full border border-dark-700/70">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[13px] font-medium text-dark-300">
                  {userCount.toLocaleString()} online
                </span>
              </div>
            </div>

            {/* Center: Search Bar - properly centered */}
            <div className="flex-1 flex justify-center px-6">
              <div className="w-full max-w-md">
                <SearchBar />
              </div>
            </div>

            {/* Right group: Actions aligned together */}
            <div className="flex items-center gap-2">
              {/* Create Post Button */}
              {isAuthenticated ? (
                <Link
                  to="/create"
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 text-[13px]"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span className="font-semibold">Confess</span>
                </Link>
              ) : (
                <button
                  onClick={handleCreatePost}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 text-[13px]"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span className="font-semibold">Confess</span>
                </button>
              )}

              {/* Subtle vertical divider */}
              <div className="w-px h-6 bg-dark-700/50 mx-1"></div>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 h-9 px-2.5 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-dark-100 transition-colors"
                title={`Switch to ${currentLanguage === 'english' ? 'Telugu' : 'English'}`}
                aria-label={`Switch to ${currentLanguage === 'english' ? 'Telugu' : 'English'}`}
              >
                <Languages size={17} />
                <span className="text-[11px] font-semibold uppercase tracking-wide">
                  {currentLanguage === 'english' ? 'EN' : 'TE'}
                </span>
              </button>

              {/* User Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-800 transition-colors"
                  aria-label={isAuthenticated ? 'Profile menu' : 'Sign in'}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-dark-800 border border-dark-700 hover:border-dark-600 transition-colors">
                    <UserCircle size={18} className="text-dark-300" />
                  </div>
                  {isAuthenticated && (
                    <span className="text-[13px] font-medium hidden lg:inline text-dark-200">{user?.username}</span>
                  )}
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl py-1 animate-in z-50">
                      {isAuthenticated ? (
                        <>
                          <Link
                            to="/my-posts"
                            className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-dark-700 transition-colors text-[13px]"
                            onClick={() => setShowMenu(false)}
                          >
                            <User size={16} />
                            <span className="font-medium">Go to Profile</span>
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors text-[13px]"
                          >
                            <LogOut size={16} />
                            <span className="font-medium">Sign Out</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            openAuthModal();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-primary-400 hover:bg-dark-700 transition-colors text-[13px]"
                        >
                          <LogIn size={16} />
                          <span className="font-medium">Sign In</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
