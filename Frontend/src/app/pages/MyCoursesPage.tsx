import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, Search, Sparkles } from 'lucide-react';
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
  completed_at?: string;
  status: 'active' | 'completed';
  total_lessons: number;
  completed_lessons: number;
  has_new_lessons: boolean;
}

export default function MyCoursesPage() {
  const { data: courses = [], loading } = usePaginatedApi<CourseEnrollment>(
    async (pageNum, limit) => {
      const res: any = await enrollmentService.getMyEnrolledCourses(pageNum, limit);
      const tp =
        res.totalPages ||
        (res.pagination && res.pagination.pages) ||
        Math.ceil((res.pagination?.total || 0) / limit);
      return { data: res.data, totalPages: tp };
    }
  );

  const [searchTerm, setSearchTerm] = useState('');

  const inProgressCourses = useMemo(
    () => courses.filter((c) => c.status !== 'completed'),
    [courses]
  );

  // Hoàn thành = học xong tất cả lesson hiện tại
  const completedCourses = useMemo(
    () => courses.filter((c) => c.status === 'completed'),
    [courses]
  );

  const filteredInProgress = useMemo(
    () => inProgressCourses.filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [inProgressCourses, searchTerm]
  );

  const filteredCompleted = useMemo(
    () => completedCourses.filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [completedCourses, searchTerm]
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Khóa học của tôi</h1>
          <p className="text-gray-600 mb-4">Quản lý và tiếp tục các khóa học của bạn</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* In Progress */}
        {filteredInProgress.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Đang học ({filteredInProgress.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInProgress.map((course) => {
                const progress = course.total_lessons > 0
                  ? Math.round((course.completed_lessons / course.total_lessons) * 100)
                  : 0;
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
                          <div className="bg-orange-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                );
              })}
            </div>
          </div>
        )}

        {/* Completed */}
        {filteredCompleted.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Đã hoàn thành ({filteredCompleted.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompleted.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition relative">

                  {/* Badge "Có nội dung mới" */}
                  {course.has_new_lessons && (
                    <div className="absolute top-0 left-0 right-0 z-10 bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                      Có nội dung mới — bạn có muốn học thêm không?
                    </div>
                  )}

                  <div className={`relative ${course.has_new_lessons ? 'mt-7' : ''}`}>
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
                    <p className="text-sm text-gray-600 mb-1">Giảng viên: {course.instructor_name}</p>
                    {course.completed_at && (
                      <p className="text-xs text-gray-400 mb-4">
                        Hoàn thành: {new Date(course.completed_at).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.total_lessons} bài học</span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/my-courses/${course.id}/lessons`}
                        className="flex-1 text-center border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition text-sm"
                      >
                        {course.has_new_lessons ? 'Học nội dung mới' : 'Xem lại'}
                      </Link>
                      {/* Nút chứng chỉ — link thẳng đến certificate của course này */}
                      <Link
                        to={`/certificates/course/${course.id}`}
                        className="flex-1 text-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition text-sm flex items-center justify-center gap-1"
                      >
                        <Award className="h-4 w-4" />
                        Chứng chỉ
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No search results */}
        {searchTerm && filteredInProgress.length === 0 && filteredCompleted.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy khóa học</h3>
            <p className="text-gray-500">Thử tìm kiếm với từ khóa khác</p>
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