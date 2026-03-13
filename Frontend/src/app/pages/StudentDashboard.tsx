import { useMemo } from 'react';
import { Layout } from '@/app/components/Layout';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Award, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePaginatedApi } from '@/hooks';
import { enrollmentService } from '@/services/api';

export default function StudentDashboard() {
  const { user } = useAuth();

  const {
    data: courses = [],
    loading,
    error,
  } = usePaginatedApi<any>(async (pageNum, limit) => {
    const res: any = await enrollmentService.getMyEnrolledCourses(pageNum, limit);
    const tp = res.totalPages || (res.pagination && res.pagination.pages) || 1;
    return { data: res.data, totalPages: tp };
  });

  const inProgressCourses = useMemo(
    () => courses.filter((c: any) => c.status === 'active'),
    [courses]
  );
  const completedCount = useMemo(
    () => courses.filter((c: any) => c.status === 'completed').length,
    [courses]
  );
  const totalLessons = useMemo(
    () => courses.reduce((sum: number, c: any) => sum + (c.total_lessons || 0), 0),
    [courses]
  );
  const averageProgress = useMemo(() => {
    if (courses.length === 0) return 0;
    const totalProgress = courses.reduce(
      (sum: number, c: any) =>
        sum + (c.total_lessons ? (c.completed_lessons / c.total_lessons) * 100 : 0),
      0
    );
    return Math.round(totalProgress / courses.length);
  }, [courses]);

  const recentCourses = useMemo(() => {
    // sort by enrolled_at desc and take first 3
    return [...courses]
      .sort((a: any, b: any) => (a.enrolled_at < b.enrolled_at ? 1 : -1))
      .slice(0, 3);
  }, [courses]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại, {user?.full_name || user?.name}!
          </h1>
          <p className="text-gray-600">Tiếp tục hành trình học tập của bạn</p>
        </div>

        {/* Loading / Error */}
        {loading && <div className="text-center py-6">Đang tải dữ liệu...</div>}
        {error && <div className="text-center py-6 text-red-600">Lỗi: {error}</div>}

        {/* Stats Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: 'Khóa học đang học',
                value: inProgressCourses.length,
                icon: BookOpen,
                color: 'bg-orange-100 text-orange-600',
              },
              {
                label: 'Khóa học hoàn thành',
                value: completedCount,
                icon: Award,
                color: 'bg-green-100 text-green-600',
              },
              { 
                label: 'Tổng bài học',
                value: totalLessons,
                icon: Clock,
                color: 'bg-purple-100 text-purple-600',
              },
              {
                label: 'Tiến độ trung bình',
                value: averageProgress + '%',
                icon: TrendingUp,
                color: 'bg-yellow-100 text-yellow-600',
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Tiếp tục học</h2>
                <Link to="/my-courses" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  Xem tất cả →
                </Link>
              </div>

              <div className="space-y-4">
                {recentCourses.map((course: any) => {
                  const progress =
                    course.total_lessons > 0
                      ? Math.round((course.completed_lessons / course.total_lessons) * 100)
                      : 0;
                  return (
                    <div
                      key={course.id}
                      className="border rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex gap-4">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                          {/* TODO: fetch next lesson or compute */}
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Tiến độ</span>
                                <span className="text-xs font-semibold text-orange-600">{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-orange-600 h-2 rounded-full"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <Link
                              to={`/my-courses/${course.id}/lessons`}
                              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition text-sm whitespace-nowrap"
                            >
                              Tiếp tục
                            </Link>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Đăng ký: {new Date(course.enrolled_at).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-2xl font-bold mb-6">Thành tựu gần đây</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Hoàn thành khóa học', icon: Award, color: 'text-yellow-500' },
                  { title: '7 ngày liên tục', icon: TrendingUp, color: 'text-green-500' },
                  { title: 'Top 10% học viên', icon: TrendingUp, color: 'text-purple-500' },
                ].map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={index} className="border rounded-lg p-4 text-center">
                      <Icon className={`h-12 w-12 mx-auto mb-2 ${achievement.color}`} />
                      <div className="text-sm font-semibold">{achievement.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Goals */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Mục tiêu tuần này</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Hoàn thành 5 bài học</span>
                    <span className="text-sm text-orange-600 font-semibold">3/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Học 10 giờ</span>
                    <span className="text-sm text-orange-600 font-semibold">7/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Thao tác nhanh</h3>
              <div className="space-y-3">
                <Link
                  to="/courses"
                  className="block w-full text-center bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition"
                >
                  Khám phá khóa học mới
                </Link>
                <Link
                  to="/progress"
                  className="block w-full text-center border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition"
                >
                  Xem tiến độ
                </Link>
                <Link
                  to="/profile"
                  className="block w-full text-center border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition"
                >
                  Cài đặt tài khoản
                </Link>
              </div>
            </div>

            {/* Recommended */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 text-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-2">Khóa học đề xuất</h3>
              <p className="text-orange-100 text-sm mb-4">
                Dựa trên lịch sử học tập của bạn
              </p>
              <Link
                to="/courses"
                className="block w-full text-center bg-white text-orange-600 py-2 rounded-md hover:bg-orange-50 transition font-semibold"
              >
                Xem ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
