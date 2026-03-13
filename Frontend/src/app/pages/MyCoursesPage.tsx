import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, PlayCircle } from 'lucide-react';
import { Layout } from '@/app/components/Layout';
import { usePaginatedApi } from '@/hooks';
import { enrollmentService } from '@/services/api';

interface CourseEnrollment {
  id: string;
  title: string;
  thumbnail: string;
  instructor_name: string;
  category_name?: string;
  enrolled_at: string;
  status: 'active' | 'completed';
  total_lessons: number;
  completed_lessons: number;
}

export default function MyCoursesPage() {
  const {
    data: courses = [],
    page,
    totalPages,
    loading,
    error,
    goToPage,
  } = usePaginatedApi<CourseEnrollment>(async (pageNum, limit) => {
    const res: any = await enrollmentService.getMyEnrolledCourses(pageNum, limit);
    // backend returns pagination.pages or totalPages depending on endpoint
    const tp =
      res.totalPages ||
      (res.pagination && res.pagination.pages) ||
      Math.ceil((res.pagination?.total || 0) / limit);
    return { data: res.data, totalPages: tp };
  });

  const inProgressCourses = useMemo(
    () => courses.filter((c) => c.status === 'active'),
    [courses]
  );
  const completedCourses = useMemo(
    () => courses.filter((c) => c.status === 'completed'),
    [courses]
  );

  const totalHours = useMemo(
    () => courses.reduce((sum, c) => sum + (c.total_lessons || 0), 0),
    [courses]
  );

  return (
    <Layout>
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Khóa học của tôi</h1>
          <p className="text-xl text-orange-100">Quản lý và tiếp tục các khóa học của bạn</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{courses.length}</div>
                <div className="text-sm text-gray-600">Tổng khóa học</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <PlayCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{inProgressCourses.length}</div>
                <div className="text-sm text-gray-600">Đang học</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{completedCourses.length}</div>
                <div className="text-sm text-gray-600">Hoàn thành</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{courses.reduce((sum, c) => sum + (c.completed_lessons || 0), 0)}</div>
                <div className="text-sm text-gray-600">Giờ đã học</div>
              </div>
            </div>
          </div>
        </div>

        {/* In Progress Courses */}
        {inProgressCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Đang học ({inProgressCourses.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map((course) => {
                const progress = course.total_lessons > 0 ? Math.round((course.completed_lessons / course.total_lessons) * 100) : 0;
                return (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                  <div className="relative">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white opacity-80" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {progress}%
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">Giảng viên: {course.instructor_name}</p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-gray-600">Tiến độ</span>
                        <span className="font-semibold text-orange-600">
                          {course.completed_lessons}/{course.total_lessons} bài học
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.completed_lessons}/{course.total_lessons} bài</span>
                      </div>
                      <span className="text-xs">Ghi danh: {new Date(course.enrolled_at).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <Link
                      to={`/my-courses/${course.id}/lessons`}
                      className="block w-full text-center bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition"
                    >
                      Tiếp tục học
                    </Link>
                  </div>
                </div>
              );})}
            </div>
          </div>
        )}

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Đã hoàn thành ({completedCourses.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                  <div className="relative">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <Award className="h-16 w-16 text-white opacity-80" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Hoàn thành
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">Giảng viên: {course.instructor_name}</p>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.total_lessons} bài học</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/my-courses/${course.id}/lessons`}
                        className="flex-1 text-center border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition"
                      >
                        Xem lại
                      </Link>
                      <Link
                        to="/progress"
                        className="flex-1 text-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                      >
                        Chứng chỉ
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {courses.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có khóa học nào</h3>
            <p className="text-gray-600 mb-6">Hãy khám phá và đăng ký các khóa học mới</p>
            <Link
              to="/courses"
              className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Khám phá khóa học
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
