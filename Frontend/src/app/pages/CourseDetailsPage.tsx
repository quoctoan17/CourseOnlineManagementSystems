import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { enrollmentService } from '@/services/api';
import { Star, Users, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { paymentService } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function CourseDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        const res = await fetch(`${API_BASE}/courses/slug/${slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error();

        if (!res.ok || !data.course) {
          navigate('/404', { replace: true });
          return;
        }

        setCourse(data.course); 

        if (user && data.course?.id) {
          try {
            const token = localStorage.getItem('token') || '';
            const enrollRes = await fetch(`${API_BASE}/enrollments/check/${data.course.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const enrollData = await enrollRes.json();
            setIsEnrolled(enrollData.is_enrolled || false);
          } catch {}
        }
      } catch (err: any) {
        navigate('/404', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, user]);


const handleEnroll = async () => {
  if (!course?.id) return;
  if (!user) { navigate('/login'); return; }

  // Miễn phí → enroll thẳng
  if (!course.price || Number(course.price) === 0) {
    setEnrolling(true);
    try {
      await enrollmentService.enroll(String(course.id));
      setIsEnrolled(true);
      navigate(`/my-courses/${course.id}/lessons`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
    return;
  }

  // Có giá → chuyển sang trang payment
  navigate(`/payment/${course.id}`, { state: { course } });
};
 


  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatPrice = (price: any) => {
    if (!price || price === 0 || price === '0') return 'Miễn phí';
    return Number(price).toLocaleString('vi-VN') + ' VND';
  };  

  return (
    <Layout>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500 text-lg">Đang tải khóa học...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">Lỗi: {error}</div>
        </div>
      ) : !course ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Không tìm thấy khóa học nào!</div>
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Link to="/courses" className="hover:text-white transition">Khóa học</Link>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-orange-400">{course.category_name || 'Chung'}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{course.title}</h1>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">{course.description}</p>
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-yellow-400">{course.rating || '4.8'}</span>
                    <span className="text-gray-400 text-sm">({course.review_count || 0} đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="h-5 w-5" />
                    <span>{course.student_count || 0} học viên</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-5 w-5" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold text-sm">
                    {getInitials(course.instructor_name || '')}
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Giảng viên</div>
                    <div className="font-semibold">{course.instructor_name || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Left */}
              <div className="flex-1 min-w-0">
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                    Bạn sẽ học được gì
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Nắm vững kiến thức cơ bản và nâng cao', 'Áp dụng vào dự án thực tế', 'Hiểu rõ các best practices', 'Xây dựng portfolio chuyên nghiệp'].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-500 mt-0.5 font-bold">✓</span>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                  <h2 className="text-xl font-bold mb-3">Về khóa học</h2>
                  <p className="text-gray-600 leading-relaxed">{course.description}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4">Giảng viên</h2>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {getInitials(course.instructor_name || '')}
                    </div>
                    <div>
                      <div className="font-semibold text-lg text-orange-600">{course.instructor_name}</div>
                      <div className="text-gray-500 text-sm mb-2">{course.instructor_email}</div>
                      <p className="text-gray-600 text-sm">Giảng viên có nhiều năm kinh nghiệm trong lĩnh vực này, đã đào tạo hàng nghìn học viên trên nền tảng trực tuyến.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — Card */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="sticky top-6 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="w-full h-48 bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-16 w-16 text-white opacity-60" />
                    )}
                  </div>
                  <div className="p-6">
                    {/* Giá — đồng nhất với /courses */}
                    <div className="text-3xl font-bold text-orange-500 mb-4">
                      {formatPrice(course.price)}
                    </div>

                    {isEnrolled ? (
                      <Link to={`/my-courses/${course.id}/lessons`}
                        className="block w-full text-center bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mb-4">
                        Tiếp tục học
                      </Link>
                    ) : (
                      <button onClick={handleEnroll} disabled={enrolling}
                        className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 mb-4">
                        {enrolling ? 'Đang ghi danh...' : 'Đăng ký khóa học'}
                      </button>
                    )}

                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Thời lượng</span>
                        </div>
                        <span className="font-medium">{course.duration || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>Học viên</span>
                        </div>
                        <span className="font-medium">{course.student_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}