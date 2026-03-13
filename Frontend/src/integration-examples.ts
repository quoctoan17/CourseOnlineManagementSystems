// API Integration Guide for Frontend Pages
// This file shows how to integrate API calls into your pages

// ============================================================
// 1. HOMEPAGE - Fetching featured courses and categories
// ============================================================
import { useEffect, useState } from 'react';
import { courseService, categoryService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export function HomePageExample() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch featured courses (top 6)
        const coursesRes: any = await courseService.getAll(1, 6);
        setCourses(coursesRes.data);

        // Fetch all categories
        const categoriesRes: any = await categoryService.getAll(1, 10);
        setCategories(categoriesRes.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div>
      {/* Featured Courses */}
      {courses.map((course: any) => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <p>Giáo viên: {course.instructor_name}</p>
          <p>Học viên: {course.student_count}</p>
        </div>
      ))}

      {/* Categories */}
      {categories.map((category: any) => (
        <div key={category.id}>
          <h4>{category.name}</h4>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 2. COURSE LIST PAGE - Fetching paginated courses with filters
// ============================================================
export function CourseListPageExample() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        let coursesRes: any;

        if (selectedCategory) {
          coursesRes = await courseService.getByCategory(selectedCategory, page, 12);
        } else {
          coursesRes = await courseService.getAll(page, 12);
        }

        setCourses(coursesRes.data);
        setTotalPages(coursesRes.totalPages);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [selectedCategory, page]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesRes: any = await categoryService.getAll(1, 50);
        setCategories(categoriesRes.data);
      } catch (err: any) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, []);

  return (
    <div>
      {/* Category Filter */}
      <select onChange={(e) => {
        setSelectedCategory(e.target.value || null);
        setPage(1);
      }}>
        <option value="">Tất cả khóa học</option>
        {categories.map((cat: any) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      {/* Course List */}
      {loading ? <div>Đang tải...</div> : null}
      {courses.map((course: any) => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <p>Học viên: {course.student_count}</p>
        </div>
      ))}

      {/* Pagination */}
      <div>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Trước</button>
        <span>{page} / {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Tiếp theo</button>
      </div>
    </div>
  );
}

// ============================================================
// 3. COURSE DETAILS PAGE - Fetching single course + enrollment check
// ============================================================
export function CourseDetailsPageExample() {
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const courseId = 'course-id-from-params'; // from useParams()

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res: any = await courseService.getById(courseId);
        setCourse(res.data);

        // Check if user is enrolled (only if logged in)
        if (user) {
          const enrollmentRes: any = await enrollmentService.checkEnrollment(courseId);
          setIsEnrolled(enrollmentRes.is_enrolled);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    setEnrolling(true);
    try {
      await enrollmentService.enroll(courseId);
      setIsEnrolled(true);
      // Redirect to lessons
      window.location.href = `/my-courses/${courseId}/lessons`;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!course) return <div>Khóa học không tìm thấy</div>;

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>Giáo viên: {course.instructor_name}</p>
      <p>Học viên: {course.student_count}</p>

      {isEnrolled ? (
        <a href={`/my-courses/${courseId}/lessons`}>Tiếp tục học</a>
      ) : (
        <button onClick={handleEnroll} disabled={enrolling}>
          {enrolling ? 'Đang ghi danh...' : 'Đăng ký khóa học'}
        </button>
      )}
    </div>
  );
}

// ============================================================
// 4. MY COURSES PAGE - Fetching student's enrolled courses
// ============================================================
export function MyCoursesPageExample() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res: any = await enrollmentService.getMyEnrolledCourses(page, 12);
        setCourses(res.data);
        setTotalPages(res.totalPages);
      } catch (err: any) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [page]);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h1>Khóa học của tôi</h1>
      {courses.length === 0 ? (
        <p>Bạn chưa đăng ký khóa học nào. <a href="/courses">Duyệt khóa học</a></p>
      ) : (
        <div>
          {courses.map((enrollment: any) => (
            <div key={enrollment.id}>
              <h3>{enrollment.course_title}</h3>
              <p>Tiến độ: {enrollment.progress_percentage}%</p>
              <a href={`/my-courses/${enrollment.course_id}/lessons`}>Xem bài học</a>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Trước</button>
        <span>{page} / {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Tiếp theo</button>
      </div>
    </div>
  );
}

// ============================================================
// 5. LESSON LIST PAGE - Fetching lessons for a course
// ============================================================
export function LessonListPageExample() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const courseId = 'course-id-from-params'; // from useParams()

  useEffect(() => {
    const loadLessons = async () => {
      try {
        // Fetch course details for title
        const courseRes: any = await courseService.getById(courseId);
        setCourseTitle(courseRes.data.title);

        // Fetch lessons
        const lessonsRes: any = await lessonService.getByCourse(courseId);
        setLessons(lessonsRes.data);
      } catch (err: any) {
        console.error('Failed to load lessons:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, [courseId]);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h1>{courseTitle}</h1>
      <ul>
        {lessons.map((lesson: any) => (
          <li key={lesson.id}>
            <a href={`/lessons/${lesson.id}`}>
              Bài {lesson.lesson_order}: {lesson.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================
// 6. LESSON DETAILS PAGE - Fetching lesson + mark as complete
// ============================================================
export function LessonDetailsPageExample() {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const lessonId = 'lesson-id-from-params'; // from useParams()
  const courseId = 'course-id-from-params'; // from useParams()

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const res: any = await lessonService.getById(lessonId);
        setLesson(res.data);

        // Check if lesson is completed
        const completionRes: any = await progressService.checkCompletion(lessonId);
        setIsCompleted(completionRes.completed);
      } catch (err: any) {
        console.error('Failed to load lesson:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      await progressService.updateProgress(lessonId, courseId);
      setIsCompleted(true);

      // Get next lesson
      const nextLessonRes: any = await lessonService.getNext(
        courseId,
        lesson.lesson_order
      );

      if (nextLessonRes.data) {
        window.location.href = `/lessons/${nextLessonRes.data.id}`;
      }
    } catch (err: any) {
      console.error('Failed to mark complete:', err);
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!lesson) return <div>Bài học không tìm thấy</div>;

  return (
    <div>
      <h1>Bài {lesson.lesson_order}: {lesson.title}</h1>

      {lesson.video_url && (
        <video width="100%" controls>
          <source src={lesson.video_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {isCompleted ? (
        <p style={{ color: 'green' }}>✓ Bạn đã hoàn thành bài học này</p>
      ) : (
        <button onClick={handleMarkComplete} disabled={marking}>
          {marking ? 'Đang cập nhật...' : 'Đánh dấu đã xem'}
        </button>
      )}
    </div>
  );
}

// ============================================================
// 7. USER PROFILE PAGE - Fetching and updating user profile
// ============================================================
export function UserProfilePageExample() {
  const { user, getMe } = useAuth();
  const [formData, setFormData] = useState({ full_name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await userService.updateProfile({
        full_name: formData.full_name,
        email: formData.email,
      });

      // Refresh user data
      await getMe();
      setSuccess('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Hồ sơ của tôi</h1>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Họ và tên:</label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// 8. ADMIN PAGES - Reports and Management
// ============================================================
export function ReportsPageExample() {
  const [stats, setStats] = useState<any>(null);
  const [duration, setDuration] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const systemStats: any = await reportService.getSystemStatistics();
        const topCourses: any = await reportService.getTopCourses(5);

        setStats({
          system: systemStats.data,
          topCourses: topCourses.data,
        });
      } catch (err: any) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h1>Báo cáo</h1>

      {stats && (
        <div>
          <h2>Thống kê hệ thống</h2>
          <p>Tổng người dùng: {stats.system.total_users}</p>
          <p>Tổng khóa học: {stats.system.total_courses}</p>
          <p>Tổng ghi danh: {stats.system.total_enrollments}</p>
          <p>Tổng chứng chỉ: {stats.system.total_certificates}</p>

          <h2>Top 5 khóa học</h2>
          <ul>
            {stats.topCourses.map((course: any) => (
              <li key={course.id}>
                {course.title} - {course.student_count} học viên
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 9. COMMON PATTERNS AND UTILITIES
// ============================================================

// Error Boundary Component
export function useApiError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any) => {
    if (err.response?.status === 403) {
      setError('Bạn không có quyền truy cập.');
    } else if (err.response?.status === 404) {
      setError('Không tìm thấy tài nguyên.');
    } else {
      setError(err.message || 'Đã xảy ra lỗi.');
    }
  };

  return { error, setError, handleError };
}

// Pagination Hook
export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return { page, totalPages, setTotalPages, goToPage };
}

// ============================================================
// 10. ENVIRONMENT CONFIGURATION
// ============================================================
// Create .env file in Frontend folder:
/*
VITE_API_URL=http://localhost:3000/api

// Production:
// VITE_API_URL=https://your-production-api.com/api
*/
