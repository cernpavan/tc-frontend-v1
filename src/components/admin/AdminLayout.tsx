import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users as UsersIcon,
  AlertTriangle,
  UserCog,
  LogOut,
  Shield,
  Menu,
  X,
  Users,
  Hash,
} from 'lucide-react';
import { useState } from 'react';
import { useAdminAuthStore } from '@store/adminAuthStore';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/posts', label: 'Posts', icon: FileText },
  { path: '/admin/users', label: 'Users', icon: UsersIcon },
  { path: '/admin/communities', label: 'Communities', icon: Users },
  { path: '/admin/tags', label: 'Tags', icon: Hash },
  { path: '/admin/reports', label: 'Reports', icon: AlertTriangle },
  { path: '/admin/sub-admins', label: 'Sub-Admins', icon: UserCog },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-dark-900 border-b border-dark-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary-400" />
          <span className="font-semibold text-white">Admin Panel</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-dark-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-dark-900 border-r border-dark-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-dark-800">
          <Shield className="w-7 h-7 text-primary-400" />
          <span className="font-bold text-lg text-white">Admin Panel</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Admin Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-800">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
              <span className="text-primary-400 font-semibold">
                {admin?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-dark-400 capitalize">{admin?.role || 'admin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
