import { Layout } from '@/app/components/Layout';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { courseService, categoryService } from '@/services/api';

export default function HomePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const courseRes: any = await courseService.getAll(1, 6);
        setCourses(courseRes.data);

        const catRes: any = await categoryService.getAll(1, 20);
        setCategories(catRes.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">Lỗi: {error}</div>;
  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Học trực tuyến với các khóa học chất lượng cao
            </h1>
            <p className="text-xl mb-8 text-orange-100">
              Nâng cao kỹ năng của bạn với hàng ngàn khóa học từ các chuyên gia hàng đầu
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/courses"
                className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
              >
                Khám phá khóa học
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-800 transition border-2 border-white"
                >
                  Đăng ký ngay
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn EduLearn?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Hàng ngàn khóa học</h3>
            <p className="text-gray-600">Học từ cơ bản đến nâng cao trong nhiều lĩnh vực</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Giảng viên chuyên nghiệp</h3>
            <p className="text-gray-600">Học từ các chuyên gia hàng đầu trong ngành</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chứng chỉ hoàn thành</h3>
            <p className="text-gray-600">Nhận chứng chỉ sau khi hoàn thành khóa học</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Học theo tiến độ</h3>
            <p className="text-gray-600">Theo dõi tiến độ học tập của bạn</p>
          </div>
        </div>
      </div>

      {/* Popular Courses Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Khóa học phổ biến</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                      <span className="text-white text-4xl">📚</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-2">
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {course.category_name}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-orange-600">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Giáo viên:</strong> {course.instructor_name}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{course.student_count} học viên</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{course.rating || 0}</span>
                    </div>
                  </div>
                  
                  {<div className="mt-4 pt-4 border-t border-gray-200">
                    {course.status === 'active' ? (
                      <span className="text-xs text-green-600 font-semibold">
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 font-semibold">
                      </span>
                    )}
                  </div>}
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-2xl font-bold text-orange-600">
                      {course.price || ''}
                    </span>
                    <Link
                      to={`/courses/${course.slug || course.id}`}
                      className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/courses"
              className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Xem tất cả khóa học
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
