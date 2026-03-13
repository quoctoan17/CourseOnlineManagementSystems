# Frontend API Integration Guide

## Tổng quan
Hướng dẫn này giải thích cách tích hợp Frontend React với Backend API để xây dựng ứng dụng Course Management System hoàn chỉnh.

## 📋 Nội dung
1. [Setup và Configuration](#setup-và-configuration)
2. [Authentication Flow](#authentication-flow)
3. [API Service Layer](#api-service-layer)
4. [Page Integration Examples](#page-integration-examples)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## Setup và Configuration

### 1. Cài đặt Environment Variables

Tạo file `.env` trong thư mục Frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Cấu trúc Folder

```
Frontend/
  src/
    services/
      api.ts              # API service layer (TẠO file này)
    context/
      AuthContext.tsx     # Authentication context (TẠO file này)
    components/
      ProtectedRoute.tsx  # Route protection (TẠO file này)
      Layout.tsx          # Layout component
      Navigation.tsx      # Navigation/header
    pages/
      LoginPage.tsx       # (CẬP NHẬT)
      RegisterPage.tsx    # (CẬP NHẬT)
      HomePage.tsx        # (CẬP NHẬT)
      CourseListPage.tsx  # (CẬP NHẬT)
      MyCoursesPage.tsx   # (CẬP NHẬT)
      ... (các trang khác)
    app/
      App.tsx             # (CẬP NHẬT)
```

### 3. Dependencies

Đảm bảo bạn đã cài đặt:
```bash
npm install react-router-dom
```

---

## Authentication Flow

### Luồng Đăng nhập:

```
1. User nhập email/password → LoginPage
2. LoginPage gọi authService.login()
3. Backend trả về { token, user }
4. AuthContext lưu token vào localStorage
5. Redirect đến /dashboard
6. Tất cả yêu cầu sau đó tự động thêm token vào header
```

### Luồng Logout:

```
1. User click logout button
2. AuthContext.logout() được gọi
3. Token xóa từ localStorage
4. User redirect về /login
5. Tất cả yêu cầu API sẽ fail nếu không có token
```

---

## API Service Layer

### File: `src/services/api.ts`

Service layer này bao gồm:

```typescript
// Authentication
authService.register()
authService.login()
authService.getMe()
authService.changePassword()

// User Management
userService.getAll()
userService.getById()
userService.update()
userService.updateProfile()
userService.requestPasswordReset()
userService.resetPassword()

// Courses
courseService.getAll()       // Get paginated courses
courseService.getById()      // Get single course
courseService.create()       // Create new course (instructor)
courseService.update()       // Update course
courseService.updateStatus() // Active/inactive course
courseService.delete()       // Delete course

// Lessons
lessonService.getByCourse()  // Get lessons in course
lessonService.getById()      // Get single lesson
lessonService.getNext()      // Get next lesson for navigation
lessonService.create()       // Create lesson
lessonService.update()       // Update lesson
lessonService.delete()       // Delete lesson

// Enrollments
enrollmentService.getMyEnrolledCourses()  // Get student's courses
enrollmentService.enroll()                // Enroll in course
enrollmentService.checkEnrollment()       // Check if enrolled
enrollmentService.unenroll()              // Unenroll from course
enrollmentService.updateStatus()          // Mark as completed

// Progress
progressService.updateProgress()          // Mark lesson as complete
progressService.getStudentProgress()      // Get course progress
progressService.getMyProgress()           // Get all user's progress
progressService.checkCompletion()         // Check if lesson completed

// Certificates
certificateService.getMyCertificates()    // Get user's certificates
certificateService.getById()              // Get single certificate
certificateService.checkStatus()          // Check if earned
certificateService.issue()                // Issue certificate (admin)

// Reports
reportService.getSystemStatistics()       // System-wide stats
reportService.getCourseStatistics()       // Course stats
reportService.getStudentStatistics()      // Student stats in course
reportService.getInstructorStatistics()   // Instructor's courses stats
reportService.getTopCourses()             // Top courses
reportService.getMonthlyReport()          // Monthly statistics
```

---

## Page Integration Examples

### 1. HomePage (Trang chủ)

```typescript
import { useEffect, useState } from 'react';
import { courseService, categoryService } from '@/services/api';

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Lấy 6 khóa học nổi bật
        const coursesRes = await courseService.getAll(1, 6);
        setCourses(coursesRes.data);

        // Lấy tất cả danh mục
        const categoriesRes = await categoryService.getAll(1, 50);
        setCategories(categoriesRes.data);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h1>Khóa học nổi bật</h1>
      {courses.map(course => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <p>Học viên: {course.student_count}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. CourseListPage (Danh sách khóa học)

```typescript
import { useEffect, useState } from 'react';
import { courseService, categoryService } from '@/services/api';
import { useSearchParams } from 'react-router-dom';

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load categories
  useEffect(() => {
    const load = async () => {
      const res = await categoryService.getAll(1, 50);
      setCategories(res.data);
    };
    load();
  }, []);

  // Load courses
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let res;
      
      if (selectedCategory) {
        res = await courseService.getByCategory(selectedCategory, page, 12);
      } else {
        res = await courseService.getAll(page, 12);
      }

      setCourses(res.data);
      setTotalPages(res.totalPages);
      setLoading(false);
    };

    load();
  }, [page, selectedCategory]);

  return (
    <div>
      {/* Filter */}
      <select onChange={(e) => {
        setSelectedCategory(e.target.value || null);
        setPage(1);
      }}>
        <option value="">Tất cả</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      {/* Courses */}
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}

      {/* Pagination */}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Trước</button>
      <span>{page} / {totalPages}</span>
      <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Tiếp theo</button>
    </div>
  );
}
```

### 3. MyCoursesPage (Khóa học của tôi)

```typescript
import { useEffect, useState } from 'react';
import { enrollmentService } from '@/services/api';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await enrollmentService.getMyEnrolledCourses(page, 12);
      setCourses(res.data);
      setTotalPages(res.totalPages);
      setLoading(false);
    };

    load();
  }, [page]);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h1>Khóa học của tôi</h1>
      {courses.length === 0 ? (
        <p>Bạn chưa đăng ký khóa học nào</p>
      ) : (
        courses.map(enrollment => (
          <div key={enrollment.id}>
            <h3>{enrollment.course_title}</h3>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#ddd' }}>
              <div 
                style={{ 
                  width: `${enrollment.progress_percentage}%`, 
                  height: '100%', 
                  backgroundColor: '#4CAF50' 
                }}
              />
            </div>
            <p>{enrollment.progress_percentage}% hoàn thành</p>
            <a href={`/my-courses/${enrollment.course_id}/lessons`}>
              Tiếp tục học
            </a>
          </div>
        ))
      )}
    </div>
  );
}
```

### 4. LessonDetailsPage (Chi tiết bài học)

```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonService, progressService } from '@/services/api';

export default function LessonDetailsPage() {
  const { lessonId, courseId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Lấy bài học
        const lessonRes = await lessonService.getById(lessonId);
        setLesson(lessonRes.data);

        // Kiểm tra xem đã hoàn thành chưa
        const completionRes = await progressService.checkCompletion(lessonId);
        setIsCompleted(completionRes.completed);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [lessonId]);

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      // Cập nhật tiến độ
      await progressService.updateProgress(lessonId, courseId);
      setIsCompleted(true);

      // Lấy bài học tiếp theo
      const nextRes = await lessonService.getNext(courseId, lesson.lesson_order);
      
      if (nextRes.data) {
        navigate(`/lessons/${nextRes.data.id}?courseId=${courseId}`);
      } else {
        navigate(`/my-courses/${courseId}/lessons`);
      }
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
        <iframe
          width="100%"
          height="600"
          src={lesson.video_url}
          allowFullScreen
        />
      )}

      <div style={{ marginTop: '20px' }}>
        {isCompleted ? (
          <p style={{ color: 'green', fontWeight: 'bold' }}>✓ Bạn đã hoàn thành bài học này</p>
        ) : (
          <button onClick={handleMarkComplete} disabled={marking}>
            {marking ? 'Đang cập nhật...' : 'Đánh dấu đã hoàn thành'}
          </button>
        )}
      </div>
    </div>
  );
}
```

### 5. UserProfilePage (Hồ sơ cá nhân)

```typescript
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api';

export default function UserProfilePage() {
  const { user, getMe } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
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
      setSuccess('Cập nhật thành công!');
    } catch (err) {
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
```

### 6. Admin - ReportsPage (Báo cáo)

```typescript
import { useEffect, useState } from 'react';
import { reportService } from '@/services/api';

export default function ReportsPage() {
  const [systemStats, setSystemStats] = useState(null);
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const sysRes = await reportService.getSystemStatistics();
        const topRes = await reportService.getTopCourses(10);

        setSystemStats(sysRes.data);
        setTopCourses(topRes.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h1>Báo cáo Hệ thống</h1>

      {systemStats && (
        <div>
          <h2>Thống kê</h2>
          <p>Tổng người dùng: {systemStats.total_users}</p>
          <p>Tổng khóa học: {systemStats.total_courses}</p>
          <p>Tổng bài học: {systemStats.total_lessons}</p>
          <p>Tổng ghi danh: {systemStats.total_enrollments}</p>
          <p>Tổng chứng chỉ: {systemStats.total_certificates}</p>
        </div>
      )}

      <h2>Top 10 Khóa học</h2>
      <ul>
        {topCourses.map(course => (
          <li key={course.id}>
            {course.title} - {course.student_count} học viên
            ({(course.completion_rate * 100).toFixed(1)}% hoàn thành)
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## State Management

### Authentication Context Hook

```typescript
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const {
    user,              // Current user object
    token,             // JWT token
    isLoading,         // Loading state
    error,             // Error message
    login,             // Login function
    logout,            // Logout function
    register,          // Register function
    changePassword,    // Change password function
    getMe,             // Refresh user data
    isAuthenticated,   // Check if logged in
    isAdmin,           // Check if admin
    isInstructor,      // Check if instructor
  } = useAuth();

  // Usage
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (isAdmin()) {
    // Show admin features
  }
}
```

---

## Error Handling

### Global Error Handling

API service tự động xử lý:

```typescript
// 401 Unauthorized - Token expired
// → Xóa token và redirect đến /login

// 400 Bad Request - Validation error
// → Hiển thị error message từ API

// 403 Forbidden - Permission denied
// → Hiển thị "Bạn không có quyền"

// 404 Not Found
// → Hiển thị "Tài nguyên không tìm thấy"

// 500 Server Error
// → Hiển thị "Đã xảy ra lỗi server"
```

### Try-Catch Pattern

```typescript
try {
  const response = await courseService.getById(courseId);
  setData(response.data);
} catch (error) {
  setError(error.message);
  console.error('Failed to load course:', error);
}
```

---

## Best Practices

### 1. ✅ Luôn kiểm tra authentication

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### 2. ✅ Tải dữ liệu khi component mount

```typescript
useEffect(() => {
  loadData();
}, []); // Dependency array trống
```

### 3. ✅ Hiển thị loading state

```typescript
{loading ? <LoadingSpinner /> : <Content />}
```

### 4. ✅ Xử lý lỗi gracefully

```typescript
{error && <ErrorAlert message={error} />}
```

### 5. ✅ Disable button khi đang loading

```typescript
<button disabled={loading}>
  {loading ? 'Đang xử lý...' : 'Gửi'}
</button>
```

### 6. ✅ Pagination cho danh sách dài

```typescript
<button onClick={() => setPage(page - 1)} disabled={page === 1}>
  Trước
</button>
<span>{page} / {totalPages}</span>
<button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
  Tiếp theo
</button>
```

### 7. ✅ Refresh data khi cần

```typescript
// Sau khi tạo/cập nhật/xóa
await createItem();
const data = await fetchData(); // Reload
setItems(data);
```

### 8. ✅ Điều hướng sau khi thành công

```typescript
try {
  await performAction();
  navigate('/success-page');
} catch (error) {
  setError(error.message);
}
```

---

## Checklist Triển khai

- [ ] Tạo file `src/services/api.ts`
- [ ] Tạo file `src/context/AuthContext.tsx`
- [ ] Tạo file `src/components/ProtectedRoute.tsx`
- [ ] Cập nhật `src/app/App.tsx`
- [ ] Cập nhật `LoginPage.tsx` để sử dụng API
- [ ] Cập nhật `RegisterPage.tsx` để sử dụng API
- [ ] Cập nhật `HomePage.tsx` để fetch khóa học
- [ ] Cập nhật `CourseListPage.tsx` để fetch khóa học + lọc
- [ ] Cập nhật `CourseDetailsPage.tsx` để fetch chi tiết + enroll
- [ ] Cập nhật `MyCoursesPage.tsx` để fetch khóa học của user
- [ ] Cập nhật `LessonListPage.tsx` để fetch bài học
- [ ] Cập nhật `LessonDetailsPage.tsx` để fetch bài học + progress
- [ ] Cập nhật `UserProfilePage.tsx` để update profile
- [ ] Cập nhật `ChangePasswordPage.tsx` để change password
- [ ] Cập nhật `admin/ReportsPage.tsx` để fetch reports
- [ ] Tạo file `.env` với `VITE_API_URL=http://localhost:3000/api`
- [ ] Test tất cả authentication endpoints
- [ ] Test tất cả course endpoints
- [ ] Test tất cả progress endpoints
- [ ] Test pagination
- [ ] Test error handling
- [ ] Test admin features

---

## Troubleshooting

### Issue: "Cannot find module 'api'"
**Solution:** Kiểm tra import path: `import { courseService } from '@/services/api'`

### Issue: 401 Unauthorized ở tất cả endpoints
**Solution:** 
1. Kiểm tra token có được lưu `localStorage.getItem('token')`
2. Kiểm tra token format: `Bearer <token>`
3. Kiểm tra JWT_SECRET ở backend

### Issue: CORS error
**Solution:** Backend cần có CORS middleware enabled

### Issue: 400 Bad Request
**Solution:** Kiểm tra request body format, ví dụ: `full_name` (không phải `fullName`)

---

## Liên hệ Support

Nếu gặp vấn đề, kiểm tra:
1. Backend log: `npm run dev` output
2. Browser console: `F12 → Console`
3. Network tab: `F12 → Network` để xem request/response
4. API_DOCUMENTATION.md cho expected request/response format

---

**Created:** 2026-03-04
**Version:** 1.0
**Status:** Ready for Implementation
