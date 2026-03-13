import { Link } from 'react-router-dom';
import { BookOpen, LogIn, LogOut, User, LayoutDashboard, GraduationCap } from 'lucide-react';
import { User as UserType } from '@/app/App';

interface NavigationProps {
  user: UserType | null;
  logout?: () => void;
}

export function Navigation({ user, logout }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-orange-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">JolibeeEdu</span>
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link to="/courses" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                Khóa học
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link to="/my-courses" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Khóa học của tôi
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/courses" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                      Quản trị
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center text-gray-700 hover:text-orange-600">
                  <User className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogIn className="h-5 w-5 mr-1" />
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
