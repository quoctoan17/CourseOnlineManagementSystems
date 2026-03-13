# 📚 API Documentation - Course Online Management System

**Base URL:** `http://localhost:3000/api`

**Phiên bản API:** v1

---

## 📋 Mục Lục

1. [Authentication (Xác thực)](#-authentication)
2. [Users (Quản lý người dùng)](#-users)
3. [Categories (Danh mục)](#-categories)
4. [Courses (Khóa học)](#-courses)
5. [Lessons (Bài học)](#-lessons)
6. [Enrollments (Đăng ký)](#-enrollments)
7. [Progress (Tiến độ)](#-progress)
8. [Certificates (Chứng chỉ)](#-certificates)
9. [Reports (Báo cáo & Thống kê)](#-reports)
10. [Error Handling (Xử lý lỗi)](#-error-handling)

---

## 🔐 Authentication

### POST /auth/register
**Mô tả:** Đăng ký tài khoản mới

**Quyền truy cập:** Public

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@email.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
```json
{
  "message": "Đăng ký thành công",
  "user": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "role": "student",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400`: Lỗi validation (email không hợp lệ, mật khẩu không khớp)
- `400`: Email đã được đăng ký

**Quy tắc nghiệp vụ (BR-01):**
- Email phải duy nhất
- Mật khẩu phải trùng confirmPassword
- Người dùng mới mặc định là student

---

### POST /auth/login
**Mô tả:** Đăng nhập vào hệ thống

**Quyền truy cập:** Public

**Request Body:**
```json
{
  "email": "nguyenvana@email.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "role": "student"
  }
}
```

**Cách sử dụng token:**
```
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Errors:**
- `401`: Email hoặc mật khẩu không chính xác

---

### GET /auth/me
**Mô tả:** Lấy thông tin user hiện tại

**Quyền truy cập:** Authenticated (cần JWT token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "role": "student",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `401`: Token không hợp lệ hoặc đã hết hạn

---

### POST /auth/change-password
**Mô tả:** Thay đổi mật khẩu (user tự mình)

**Quyền truy cập:** Authenticated

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**Response (200):**
```json
{
  "message": "Đổi mật khẩu thành công"
}
```

**Errors:**
- `401`: Mật khẩu hiện tại không chính xác
- `400`: Mật khẩu mới không khớp

---

## 👥 Users

### GET /users
**Mô tả:** Lấy danh sách tất cả users (phân trang)

**Quyền truy cập:** Admin only

**Query Parameters:**
```
?page=1&limit=10
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "role": "student",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

### GET /users/:id
**Mô tả:** Lấy thông tin user theo ID

**Quyền truy cập:** User tự mình hoặc admin

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "role": "student",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `404`: Người dùng không tồn tại

---

### PUT /users/profile/update
**Mô tả:** Cập nhật profile cá nhân (user tự mình)

**Quyền truy cập:** Authenticated

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A Mới",
  "email": "nguyenvana.new@email.com"
}
```

**Response (200):**
```json
{
  "message": "Cập nhật thông tin thành công",
  "user": {
    "id": 1,
    "full_name": "Nguyễn Văn A Mới",
    "email": "nguyenvana.new@email.com",
    "role": "student",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Lưu ý:** User không thể thay đổi role

---

### PUT /users/:id
**Mô tả:** Cập nhật user (user tự mình hoặc admin)

**Quyền truy cập:** Authenticated

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A Mới",
  "email": "nguyenvana.new@email.com",
  "role": "student"
}
```

**Response (200):**
```json
{
  "message": "Cập nhật thành công",
  "user": { ... }
}
```

---

### DELETE /users/:id
**Mô tả:** Xóa user

**Quyền truy cập:** Admin only

**Response (200):**
```json
{
  "message": "Xóa người dùng thành công"
}
```

**Errors:**
- `400`: Không thể xóa user admin

---

### POST /users/forgot-password
**Mô tả:** Yêu cầu reset mật khẩu (self-service)

**Quyền truy cập:** Public

**Request Body:**
```json
{
  "email": "nguyenvana@email.com"
}
```

**Response (200):**
```json
{
  "message": "Nếu tài khoản tồn tại, link reset mật khẩu sẽ được gửi",
  "resetToken": "MQ==" // Development only
}
```

**Lưu ý:** Luôn trả về message này (security best practice)

---

### POST /users/:id/reset-password
**Mô tả:** Đặt lại mật khẩu (admin)

**Quyền truy cập:** Admin only

**Request Body:**
```json
{
  "newPassword": "newpassword456"
}
```

**Response (200):**
```json
{
  "message": "Đặt lại mật khẩu thành công"
}
```

---

## 📂 Categories

### GET /categories
**Mô tả:** Lấy danh sách tất cả categories

**Quyền truy cập:** Public

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Backend",
      "description": "Các khóa học về lập trình Backend"
    },
    {
      "id": 2,
      "name": "Frontend",
      "description": "Các khóa học về lập trình Frontend"
    }
  ]
}
```

---

### GET /categories/:id
**Mô tả:** Lấy category theo ID

**Quyền truy cập:** Public

**Response (200):**
```json
{
  "category": {
    "id": 1,
    "name": "Backend",
    "description": "Các khóa học về lập trình Backend"
  }
}
```

---

### POST /categories
**Mô tả:** Tạo category mới

**Quyền truy cập:** Admin only

**Request Body:**
```json
{
  "name": "Mobile",
  "description": "Các khóa học về lập trình Mobile"
}
```

**Response (201):**
```json
{
  "message": "Tạo category thành công",
  "category": {
    "id": 3,
    "name": "Mobile",
    "description": "Các khóa học về lập trình Mobile"
  }
}
```

---

### PUT /categories/:id
**Mô tả:** Cập nhật category

**Quyền truy cập:** Admin only

**Response (200):**
```json
{
  "message": "Cập nhật category thành công",
  "category": { ... }
}
```

---

### DELETE /categories/:id
**Mô tả:** Xóa category

**Quyền truy cập:** Admin only

**Response (200):**
```json
{
  "message": "Xóa category thành công"
}
```

---

## 📚 Courses

### GET /courses
**Mô tả:** Lấy danh sách tất cả courses (public)

**Quyền truy cập:** Public

**Query Parameters:**
```
?page=1&limit=10
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "React & TypeScript - Từ cơ bản đến nâng cao",
      "description": "Khóa học toàn diện về React và TypeScript",
      "thumbnail": "https://...",
      "instructor_id": 5,
      "instructor_name": "Lê Văn C",
      "category_id": 1,
      "category_name": "Frontend",
      "status": "active",
      "student_count": 1234,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

### GET /courses/:id
**Mô tả:** Lấy thông tin chi tiết course

**Quyền truy cập:** Public

**Response (200):**
```json
{
  "course": {
    "id": 1,
    "title": "React & TypeScript - Từ cơ bản đến nâng cao",
    "description": "Khóa học toàn diện về React và TypeScript",
    "thumbnail": "https://...",
    "instructor_id": 5,
    "instructor_name": "Lê Văn C",
    "instructor_email": "levanc@email.com",
    "category_id": 1,
    "category_name": "Frontend",
    "status": "active",
    "student_count": 1234,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /courses/by-category/:categoryId
**Mô tả:** Lấy courses theo category

**Quyền truy cập:** Public

**Query Parameters:**
```
?page=1&limit=10
```

**Response (200):** Similar to GET /courses

---

### POST /courses
**Mô tả:** Tạo course mới

**Quyền truy cập:** Instructor, Admin

**Request Body:**
```json
{
  "title": "React & TypeScript - Từ cơ bản đến nâng cao",
  "description": "Khóa học toàn diện về React và TypeScript",
  "thumbnail": "https://...",
  "categoryId": 1
}
```

**Response (201):**
```json
{
  "message": "Tạo khóa học thành công",
  "course": {
    "id": 1,
    "title": "React & TypeScript - Từ cơ bản đến nâng cao",
    "description": "Khóa học toàn diện về React và TypeScript",
    "thumbnail": "https://...",
    "instructor_id": 5,
    "category_id": 1,
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### PUT /courses/:id
**Mô tả:** Cập nhật course

**Quyền truy cập:** Course instructor, Admin

**Request Body:**
```json
{
  "title": "React & TypeScript - Cập nhật",
  "description": "Khóa học cập nhật...",
  "thumbnail": "https://...",
  "categoryId": 1
}
```

**Response (200):**
```json
{
  "message": "Cập nhật khóa học thành công",
  "course": { ... }
}
```

---

### PATCH /courses/:id/status
**Mô tả:** Cập nhật status course (active/inactive)

**Quyền truy cập:** Course instructor, Admin

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Response (200):**
```json
{
  "message": "Cập nhật trạng thái khóa học thành công",
  "course": {
    "id": 1,
    "title": "React & TypeScript...",
    "status": "inactive",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Quy tắc nghiệp vụ (BR-12):**
- Nếu course bị vô hiệu hóa, người mới không thể enroll
- Người đã enroll vẫn có thể học tiếp

---

### DELETE /courses/:id
**Mô tả:** Xóa course

**Quyền truy cập:** Course instructor, Admin

**Response (200):**
```json
{
  "message": "Xóa khóa học thành công"
}
```

---

## 📖 Lessons

### GET /lessons/course/:courseId
**Mô tả:** Lấy danh sách lessons của course

**Quyền truy cập:** Public

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "course_id": 1,
      "title": "Giới thiệu React",
      "video_url": "https://youtube.com/watch?v=...",
      "lesson_order": 1
    },
    {
      "id": 2,
      "course_id": 1,
      "title": "Components & Props",
      "video_url": "https://youtube.com/watch?v=...",
      "lesson_order": 2
    }
  ],
  "course": {
    "id": 1,
    "title": "React & TypeScript..."
  }
}
```

---

### GET /lessons/:id
**Mô tả:** Lấy chi tiết lesson

**Quyền truy cập:** Public

**Response (200):**
```json
{
  "lesson": {
    "id": 1,
    "course_id": 1,
    "title": "Giới thiệu React",
    "video_url": "https://youtube.com/watch?v=...",
    "lesson_order": 1,
    "course_title": "React & TypeScript..."
  }
}
```

---

### GET /lessons/page/next
**Mô tả:** Lấy lesson tiếp theo

**Quyền truy cập:** Public

**Query Parameters:**
```
?courseId=1&lessonOrder=1
```

**Response (200):**
```json
{
  "lesson": {
    "id": 2,
    "course_id": 1,
    "title": "Components & Props",
    "video_url": "https://youtube.com/watch?v=...",
    "lesson_order": 2
  }
}
```

**Response (200) - Không có lesson tiếp theo:**
```json
{
  "lesson": null
}
```

---

### POST /lessons
**Mô tả:** Tạo lesson mới

**Quyền truy cập:** Course instructor, Admin

**Request Body:**
```json
{
  "courseId": 1,
  "title": "Giới thiệu React",
  "videoUrl": "https://youtube.com/watch?v=...",
  "lessonOrder": 1
}
```

**Response (201):**
```json
{
  "message": "Tạo bài học thành công",
  "lesson": {
    "id": 1,
    "course_id": 1,
    "title": "Giới thiệu React",
    "video_url": "https://youtube.com/watch?v=...",
    "lesson_order": 1
  }
}
```

---

### PUT /lessons/:id
**Mô tả:** Cập nhật lesson

**Quyền truy cập:** Course instructor, Admin

**Response (200):**
```json
{
  "message": "Cập nhật bài học thành công",
  "lesson": { ... }
}
```

---

### DELETE /lessons/:id
**Mô tả:** Xóa lesson

**Quyền truy cập:** Course instructor, Admin

**Response (200):**
```json
{
  "message": "Xóa bài học thành công"
}
```

---

## 📝 Enrollments

### POST /enrollments
**Mô tả:** Đăng ký khóa học

**Quyền truy cập:** Authenticated (Student)

**Request Body:**
```json
{
  "courseId": 1
}
```

**Response (201):**
```json
{
  "message": "Đăng ký khóa học thành công",
  "enrollment": {
    "id": 1,
    "user_id": 2,
    "course_id": 1,
    "enrolled_at": "2024-01-15T10:30:00Z",
    "status": "active"
  }
}
```

**Errors:**
- `401`: Cần đăng nhập (BR-01)
- `400`: Bạn đã đăng ký khóa học này rồi (BR-03)

**Message:** MSG03 - Ghi danh khóa học thành công

---

### GET /enrollments/my-courses
**Mô tả:** Lấy danh sách courses đã đăng ký

**Quyền truy cập:** Authenticated (Student)

**Query Parameters:**
```
?page=1&limit=10
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "React & TypeScript...",
      "description": "...",
      "thumbnail": "https://...",
      "instructor_id": 5,
      "instructor_name": "Lê Văn C",
      "category_id": 1,
      "category_name": "Frontend",
      "enrolled_at": "2024-01-15T10:30:00Z",
      "status": "active",
      "total_lessons": 40,
      "completed_lessons": 15,
      "progress_percentage": 37.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10
  }
}
```

**Quy tắc (BR-06):**
- Chỉ hiển thị courses mà user đã enroll

---

### GET /enrollments/check/enrollment
**Mô tả:** Kiểm tra đã đăng ký course chưa

**Quyền truy cập:** Authenticated

**Query Parameters:**
```
?courseId=1
```

**Response (200):**
```json
{
  "enrolled": true,
  "enrollment": {
    "id": 1,
    "user_id": 2,
    "course_id": 1,
    "enrolled_at": "2024-01-15T10:30:00Z",
    "status": "active"
  }
}
```

**Response (200) - Chưa đăng ký:**
```json
{
  "enrolled": false,
  "enrollment": null
}
```

---

### GET /enrollments/course/:courseId/students
**Mô tả:** Lấy danh sách students của course

**Quyền truy cập:** Course instructor, Admin

**Query Parameters:**
```
?page=1&limit=10
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 2,
      "full_name": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "role": "student",
      "enrolled_at": "2024-01-15T10:30:00Z",
      "status": "active",
      "total_lessons": 40,
      "completed_lessons": 15,
      "progress_percentage": 37.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10
  }
}
```

---

### DELETE /enrollments/:courseId
**Mô tả:** Hủy đăng ký khóa học

**Quyền truy cập:** Authenticated (Student)

**Response (200):**
```json
{
  "message": "Hủy đăng ký thành công"
}
```

---

### PATCH /enrollments/:enrollmentId/status
**Mô tả:** Cập nhật status enrollment (active/completed)

**Quyền truy cập:** Admin only

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "message": "Cập nhật trạng thái thành công",
  "enrollment": {
    "id": 1,
    "user_id": 2,
    "course_id": 1,
    "enrolled_at": "2024-01-15T10:30:00Z",
    "status": "completed"
  }
}
```

---

## ⚡ Progress

### POST /progress
**Mô tả:** Cập nhật tiến độ bài học

**Quyền truy cập:** Authenticated (Student)

**Request Body:**
```json
{
  "lessonId": 1,
  "completed": true
}
```

**Response (200):**
```json
{
  "message": "Cập nhật tiến độ thành công",
  "progress": {
    "id": 1,
    "user_id": 2,
    "lesson_id": 1,
    "completed": true,
    "completed_at": "2024-01-15T10:30:00Z"
  }
}
```

**Quy tắc (BR-07, BR-11):**
- Lưu trạng thái hoàn thành bài học
- Tính tiến độ = (bài học hoàn thành / tổng bài học) * 100%

---

### GET /progress/course/:courseId
**Mô tả:** Lấy tiến độ học sinh trong course

**Quyền truy cập:** Authenticated (Student)

**Response (200):**
```json
{
  "course": {
    "id": 1,
    "title": "React & TypeScript..."
  },
  "lessons": [
    {
      "id": 1,
      "title": "Giới thiệu React",
      "lesson_order": 1,
      "completed": true,
      "completed_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "title": "Components & Props",
      "lesson_order": 2,
      "completed": false,
      "completed_at": null
    }
  ],
  "summary": {
    "totalLessons": 40,
    "completedLessons": 15,
    "progressPercentage": 37.5
  }
}
```

---

### GET /progress/my-progress
**Mô tả:** Lấy tất cả tiến độ của user

**Quyền truy cập:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "lesson_id": 1,
      "completed": true,
      "completed_at": "2024-01-15T10:30:00Z",
      "lesson_title": "Giới thiệu React",
      "course_id": 1,
      "course_title": "React & TypeScript..."
    }
  ]
}
```

---

### GET /progress/check/lesson
**Mô tả:** Kiểm tra đã hoàn thành bài học chưa

**Quyền truy cập:** Authenticated

**Query Parameters:**
```
?lessonId=1
```

**Response (200):**
```json
{
  "completed": true,
  "progress": {
    "id": 1,
    "user_id": 2,
    "lesson_id": 1,
    "completed": true,
    "completed_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /progress/stats/:courseId
**Mô tả:** Lấy thống kê tiến độ lớp (cho instructor)

**Quyền truy cập:** Course instructor, Admin

**Response (200):**
```json
{
  "course": {
    "id": 1,
    "title": "React & TypeScript..."
  },
  "statistics": {
    "totalStudents": 50,
    "completionRate": 40 // %
  }
}
```

---

## 🏆 Certificates

### GET /certificates/my-certificates
**Mô tả:** Lấy danh sách chứng chỉ của user

**Quyền truy cập:** Authenticated

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "course_id": 1,
      "issued_at": "2024-01-15T10:30:00Z",
      "certificate_url": "https://...",
      "course_title": "React & TypeScript...",
      "course_description": "...",
      "user_name": "Nguyễn Văn A"
    }
  ]
}
```

**Quy tắc (BR-08, BR-09):**
- Chứng chỉ chỉ được cấp khi hoàn thành 100% bài học
- Mỗi user + course chỉ có 1 chứng chỉ

---

### GET /certificates/:id
**Mô tả:** Lấy chi tiết chứng chỉ

**Quyền truy cập:** Owner hoặc admin

**Response (200):**
```json
{
  "certificate": {
    "id": 1,
    "user_id": 2,
    "course_id": 1,
    "issued_at": "2024-01-15T10:30:00Z",
    "certificate_url": "https://...",
    "course_title": "React & TypeScript...",
    "user_name": "Nguyễn Văn A",
    "user_email": "nguyenvana@email.com"
  }
}
```

---

### GET /certificates/check/status
**Mô tả:** Kiểm tra đã có chứng chỉ chưa

**Quyền truy cập:** Authenticated

**Query Parameters:**
```
?courseId=1
```

**Response (200):**
```json
{
  "hasCertificate": true,
  "certificate": {
    "id": 1,
    "user_id": 2,
    "course_id": 1,
    "issued_at": "2024-01-15T10:30:00Z",
    "certificate_url": "https://..."
  }
}
```

---

### POST /certificates
**Mô tả:** Cấp chứng chỉ cho sinh viên (admin)

**Quyền truy cập:** Admin only

**Request Body:**
```json
{
  "userId": 2,
  "courseId": 1
}
```

**Response (201):**
```json
{
  "message": "Chứng chỉ được cấp thành công",
  "certificate": {
    "id": 1,
    "user_id": 2,
    "course_id": 1,
    "issued_at": "2024-01-15T10:30:00Z",
    "certificate_url": null
  }
}
```

**Errors:**
- `400`: Sinh viên chưa hoàn thành khóa học
- `400`: Chứng chỉ đã được cấp rồi

**Message:** MSG05 - Chúc mừng! Bạn đã hoàn thành khóa học

---

### GET /certificates/course/:courseId/certificates
**Mô tả:** Danh sách sinh viên đã nhận chứng chỉ

**Quyền truy cập:** Course instructor, Admin

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "course_id": 1,
      "issued_at": "2024-01-15T10:30:00Z",
      "user_name": "Nguyễn Văn A",
      "user_email": "nguyenvana@email.com"
    }
  ]
}
```

---

### DELETE /certificates/:id
**Mô tả:** Xóa chứng chỉ

**Quyền truy cập:** Admin only

**Response (200):**
```json
{
  "message": "Xóa chứng chỉ thành công"
}
```

---

## 📊 Reports

### GET /reports/system/statistics
**Mô tả:** Thống kê tổng quan hệ thống

**Quyền truy cập:** Admin only

**Response (200):**
```json
{
  "statistics": {
    "users": {
      "total": 1000,
      "students": 800,
      "instructors": 200
    },
    "content": {
      "courses": 50,
      "lessons": 500
    },
    "engagement": {
      "enrollments": 2000,
      "certificatesIssued": 300
    }
  }
}
```

---

### GET /reports/course/:courseId/statistics
**Mô tả:** Thống kê khóa học

**Quyền truy cập:** Course instructor, Admin

**Response (200):**
```json
{
  "course": {
    "id": 1,
    "title": "React & TypeScript..."
  },
  "statistics": {
    "enrollment": {
      "total": 100,
      "completed": 40,
      "completionRate": "40%"
    },
    "engagement": {
      "averageProgress": "75%",
      "certificatesIssued": 40
    },
    "content": {
      "totalLessons": 40
    }
  }
}
```

---

### GET /reports/course/:courseId/students
**Mô tả:** Thống kê chi tiết sinh viên (instructor view)

**Quyền truy cập:** Course instructor, Admin

**Response (200):**
```json
{
  "course": {
    "id": 1,
    "title": "React & TypeScript..."
  },
  "data": [
    {
      "id": 2,
      "full_name": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "enrolled_at": "2024-01-15T10:30:00Z",
      "status": "active",
      "total_lessons": 40,
      "completed_lessons": 30,
      "progress_percentage": 75,
      "has_certificate": true
    }
  ],
  "totalStudents": 100
}
```

---

### GET /reports/instructor/:instructorId/statistics
**Mô tả:** Thống kê instructor

**Quyền truy cập:** Admin only

**Response (200):**
```json
{
  "instructor": {
    "id": 5
  },
  "statistics": {
    "totalCourses": 5,
    "totalStudents": 500,
    "totalCertificatesIssued": 150
  },
  "courses": [
    {
      "id": 1,
      "title": "React & TypeScript...",
      "total_students": 100,
      "completed_students": 40,
      "certificates_issued": 40,
      "completion_rate": "40%"
    }
  ]
}
```

---

### GET /reports/top-courses
**Mô tả:** Top courses phổ biến nhất

**Quyền truy cập:** Admin only

**Query Parameters:**
```
?limit=10
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "React & TypeScript...",
      "description": "...",
      "instructor_name": "Lê Văn C",
      "student_count": 500,
      "certificates_issued": 200,
      "avg_completion_rate": 40
    }
  ]
}
```

---

### GET /reports/monthly/:year/:month
**Mô tả:** Báo cáo tháng

**Quyền truy cập:** Admin only

**Path Parameters:**
```
/reports/monthly/2024/01
```

**Response (200):**
```json
{
  "period": "1/2024",
  "report": {
    "newUsers": 50,
    "newEnrollments": 200,
    "newStudents": 100,
    "coursesInvolved": 15,
    "certificatesIssued": 50
  }
}
```

---

## ⚠️ Error Handling

### Error Response Format
```json
{
  "error": "Mô tả lỗi"
}
```

### HTTP Status Codes

| Code | Meaning | Ví dụ |
|------|---------|-------|
| 200 | OK | Request thành công |
| 201 | Created | Tạo resource thành công |
| 400 | Bad Request | Validation error, email đã tồn tại |
| 401 | Unauthorized | Token không hợp lệ, chưa đăng nhập |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Resource không tồn tại |
| 500 | Server Error | Lỗi server |

### Các Error Messages Thường Gặp

| Code | Message | Tình huống |
|------|---------|-----------|
| 400 | Email đã được đăng ký | Register với email đã tồn tại |
| 400 | Bạn đã đăng ký khóa học này rồi | Enroll trùng course |
| 401 | Email hoặc mật khẩu không chính xác | Login sai credentials |
| 401 | Token không hợp lệ hoặc đã hết hạn | Sử dụng token cũ/sai |
| 403 | Không có quyền truy cập resource này | User không phải admin |
| 404 | Khóa học không tồn tại | GET course với ID không tồn tại |

---

## 📪 Email Notifications

### Khi nào gửi email?

1. **Đăng ký thành công** → Register confirmation
2. **Hoàn thành khóa học** → Certificate issued
3. **Yêu cầu reset mật khẩu** → Password reset link

### Email Content

**Đăng ký:**
```
Subject: 🎉 Chào mừng bạn tới EduLearn!
Body: Tài khoản của bạn đã được tạo thành công...
```

**Chứng chỉ:**
```
Subject: 🏆 Chúc mừng! Bạn đã hoàn thành khóa học
Body: Bạn đã hoàn thành khóa học [course_name]...
```

**Reset mật khẩu:**
```
Subject: 🔐 Yêu cầu đặt lại mật khẩu
Body: Nhấp vào liên kết để đặt lại mật khẩu...
```

---

## 🔄 Rate Limiting

Hiện tại chưa implement rate limiting. Recommended:
- 100 requests/minute cho authenticated users
- 10 requests/minute cho public endpoints

---

## 📄 OpenAPI/Swagger

API này tuân theo RESTful principles và có thể tích hợp Swagger/OpenAPI.

**TODO:** Thêm Swagger documentation endpoint `/api/docs`

---

## 🔮 Tương Lai

- [ ] Webhook support
- [ ] GraphQL endpoint
- [ ] Real-time notifications (WebSocket)
- [ ] File upload (courses, lessons)
- [ ] Payment integration
- [ ] OAuth2 (Google, GitHub)
- [ ] API versioning (v2, v3)

---

**Phiên bản:** v1.0  
**Cập nhật:** 2024-01-15  
**Liên hệ:** support@elearning.com
