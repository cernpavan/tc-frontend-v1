import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 border-b border-dark-800">
        <Link to="/" className="text-xl font-bold text-primary-400">
          Telugu Confession
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-dark-500 text-sm">
        <p>18+ only. By using this platform, you agree to our Terms & Conditions.</p>
      </footer>
    </div>
  );
}
