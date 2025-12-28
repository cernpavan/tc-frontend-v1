import { lazy, Suspense, memo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';
import { useAdminAuthStore } from '@store/adminAuthStore';

// Loading Spinner Component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-dark-400 text-sm">Loading...</span>
    </div>
  </div>
);

// Layouts - Keep non-lazy as they wrap other routes
import MainLayout from '@components/layouts/MainLayout';
import AuthLayout from '@components/layouts/AuthLayout';

// Auth Components
import AuthModal from '@components/auth/AuthModal';

// Lazy load all page components for code splitting
const Landing = lazy(() => import('@pages/Landing'));
const Login = lazy(() => import('@pages/auth/Login'));
const Register = lazy(() => import('@pages/auth/Register'));
const AgeGate = lazy(() => import('@pages/auth/AgeGate'));
const Feed = lazy(() => import('@pages/Feed'));
const PostDetail = lazy(() => import('@pages/PostDetail'));
const CreatePost = lazy(() => import('@pages/CreatePost'));
const Settings = lazy(() => import('@pages/Settings'));
const MyPosts = lazy(() => import('@pages/MyPosts'));
const SearchResults = lazy(() => import('@pages/SearchResults'));
const CommunityPage = lazy(() => import('@pages/CommunityPage'));
const Kamakadhu = lazy(() => import('@pages/Kamakadhu'));
const Terms = lazy(() => import('@pages/Terms'));
const NotFound = lazy(() => import('@pages/NotFound'));

// Admin Pages - Lazy loaded
const AdminLayout = lazy(() => import('@components/admin/AdminLayout'));
const AdminLogin = lazy(() => import('@pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@pages/admin/Dashboard'));
const AdminPosts = lazy(() => import('@pages/admin/Posts'));
const AdminUsers = lazy(() => import('@pages/admin/Users'));
const AdminReports = lazy(() => import('@pages/admin/Reports'));
const AdminSubAdmins = lazy(() => import('@pages/admin/SubAdmins'));
const AdminCommunities = lazy(() => import('@pages/admin/Communities'));
const AdminTags = lazy(() => import('@pages/admin/Tags'));

// Protected Route Component - Memoized with selector for better performance
const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

// Public Route - Memoized
const PublicRoute = memo(({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
});

PublicRoute.displayName = 'PublicRoute';

// Admin Protected Route - Memoized
const AdminProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
});

AdminProtectedRoute.displayName = 'AdminProtectedRoute';

// Admin Public Route - Memoized
const AdminPublicRoute = memo(({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
});

AdminPublicRoute.displayName = 'AdminPublicRoute';

function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/age-verify" element={<AgeGate />} />
          <Route path="/terms" element={<Terms />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
          </Route>

          {/* Main Routes - Public access to viewing, protected for posting */}
          <Route element={<MainLayout />}>
            {/* Public viewing routes */}
            <Route path="/feed" element={<Feed />} />
            <Route path="/feed/tag/:tagSlug" element={<Feed />} />
            <Route path="/feed/:filter" element={<Feed />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/community/:slug" element={<CommunityPage />} />
            <Route path="/kamakadhu" element={<Kamakadhu />} />

            {/* Protected routes */}
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-posts"
              element={
                <ProtectedRoute>
                  <MyPosts />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/login"
            element={
              <AdminPublicRoute>
                <AdminLogin />
              </AdminPublicRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="sub-admins" element={<AdminSubAdmins />} />
            <Route path="communities" element={<AdminCommunities />} />
            <Route path="tags" element={<AdminTags />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Auth Modal */}
      <AuthModal />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#f1f5f9',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9',
            },
          },
        }}
      />
    </>
  );
}

export default App;
