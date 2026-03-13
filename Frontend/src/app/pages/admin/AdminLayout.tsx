import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navigation } from '@/app/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { Users, BookOpen, Folder, BarChart2 } from 'lucide-react';
import { Layout } from '@/app/components/Layout';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { path: '/admin/users', label: 'Quản lý học viên', icon: Users },
  { path: '/admin/courses', label: 'Quản lý khóa học', icon: BookOpen },
  { path: '/admin/categories', label: 'Quản lý danh mục', icon: Folder },
  { path: '/admin/reports', label: 'Báo cáo & Thống kê', icon: BarChart2 },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation user={user} logout={logout} />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Bảng điều khiển</span>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}