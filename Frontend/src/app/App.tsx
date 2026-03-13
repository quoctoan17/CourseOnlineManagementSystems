import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomePage from '@/app/pages/HomePage';
import LoginPage from '@/app/pages/LoginPage';
import RegisterPage from '@/app/pages/RegisterPage';
import CourseListPage from '@/app/pages/CourseListPage';
import CourseDetailsPage from '@/app/pages/CourseDetailsPage';
import StudentDashboard from '@/app/pages/StudentDashboard';
import MyCoursesPage from '@/app/pages/MyCoursesPage';
import LessonListPage from '@/app/pages/LessonListPage';
import LessonDetailsPage from '@/app/pages/LessonDetailsPage';
import LearningProgressPage from '@/app/pages/LearningProgressPage';
import UserProfilePage from '@/app/pages/UserProfilePage';
import ChangePasswordPage from '@/app/pages/ChangePasswordPage';
import UserManagementPage from '@/app/pages/admin/UserManagementPage';
import CourseManagementPage from '@/app/pages/admin/CourseManagementPage';
import CategoryManagementPage from '@/app/pages/admin/CategoryManagementPage';
import ReportsPage from '@/app/pages/admin/ReportsPage';
import AdminLessonManagementPage from '@/app/pages/admin/AdminLessonManagementPage';
import ForgotPasswordPage from '@/app/pages/ForgotPasswordPage';


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/courses/:slug" element={<CourseDetailsPage />} />

          {/* Protected Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute>
                <MyCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses/:courseId/lessons"
            element={
              <ProtectedRoute>
                <LessonListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:lessonId"
            element={
              <ProtectedRoute>
                <LessonDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <LearningProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute requiredRole="admin">
                <CourseManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requiredRole="admin">
                <CategoryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/:courseId/lessons"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLessonManagementPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
