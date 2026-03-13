import { ReactNode } from 'react';
import { Navigation } from '@/app/components/Navigation';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation user={user} logout={logout} />
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <p className="text-sm">&copy; 2026 EduLearn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}