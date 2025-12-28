import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Header from '@components/common/Header';
import Sidebar from '@components/common/Sidebar';
import BottomNav from '@components/common/BottomNav';

export default function MainLayout() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    const handleToggle = () => setShowMobileSidebar(prev => !prev);
    window.addEventListener('toggleMobileSidebar', handleToggle);
    return () => window.removeEventListener('toggleMobileSidebar', handleToggle);
  }, []);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMobileSidebar) {
        setShowMobileSidebar(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showMobileSidebar]);

  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden max-w-full">
      <Header />

      <div className="flex">
        {/* Desktop Sidebar - Fixed on left */}
        <aside className="hidden lg:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-dark-750 bg-dark-900 scrollbar-hide">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar - Slide-out overlay */}
        {showMobileSidebar && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
              onClick={() => setShowMobileSidebar(false)}
              aria-hidden="true"
            />
            {/* Sidebar Panel */}
            <aside
              className="fixed left-0 top-0 bottom-0 w-72 bg-dark-900 z-50 lg:hidden overflow-y-auto animate-slide-in-left shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-750 sticky top-0 bg-dark-900/98 backdrop-blur-md z-10">
                <span className="text-lg font-bold text-gradient">
                  Telugu Confessions
                </span>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="btn-icon bg-transparent text-dark-300 hover:bg-dark-800 hover:text-dark-100"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <Sidebar />
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)]">
          <div className="max-w-3xl mx-auto px-4 py-6 pb-bottom-nav lg:pb-6 overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
