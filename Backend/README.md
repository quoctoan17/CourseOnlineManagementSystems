# Backend - Online Course Management System

API Backend xây dựng bằng **Node.js + Express + PostgreSQL** theo mô hình **MVC (Model-View-Controller)**.

## 📋 Cấu Trúc Dự Án

```
Backend/
├── src/
│   ├── config/              # Cấu hình (database)
│   │   └── database.js
│   ├── models/              # Models (M trong MVC) - tương tác database
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Course.js
│   │   ├── Lesson.js
│   │   ├── Enrollment.js
│   │   └── Progress.js
│   ├── controllers/         # Controllers (C trong MVC) - business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── categoryController.js
│   │   ├── courseController.js
│   │   ├── lessonController.js
│   │   ├── enrollmentController.js
│   │   └── progressController.js
│   ├── routes/              # Routes (R trong MVC) - định nghĩa endpoints
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── lessonRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   └── progressRoutes.js
│   ├── middleware/          # Middleware (xác thực, validate)
│   │   └── auth.js
│   ├── utils/               # Utility functions
│   │   └── auth.js
│   └── server.js            # Main server file
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── setupDatabase.js         # Script tạo database tables
└── README.md
```

## 🚀 Hướng Dẫn Setup

### 1. **Cài đặt Dependencies**
```bash
npm install
```

### 2. **Tạo File .env**
Copy file `.env.example` thành `.env` và điền thông tin của bạn:
```bash
cp .env.example .env
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=course_management
DB_USER=postgres
DB_PASSWORD=your_password_here

PORT=3000
NODE_ENV=development

JWT_SECRET=your_very_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=24h
```

### 3. **Tạo PostgreSQL Database**
```bash
# Tạo database trong PostgreSQL
createdb courses_online_mangagement_systems
```

### 4. **Chạy Setup Database Script**
```bash
npm run setup-db
```
Script này sẽ tạo tất cả các tables và indexes.

### 5. **Chạy Server**

**Development (với hot reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server sẽ chạy trên `http://localhost:3000`

## 📚 Mô Hình MVC Giải Thích

### **Models (M) - src/models/**
- Tương tác trực tiếp với database
- Chứa query logic
- Ví dụ: `User.js` có các method như `create`, `findById`, `update`, `delete`

```javascript
// Ví dụ:
const user = await User.findById(1);
const newUser = await User.create('John Doe', 'john@email.com', ...);
```

### **Controllers (C) - src/controllers/**
- Xử lý business logic
- Nhận request, gọi Models, trả response
- Validate dữ liệu đầu vào
- Ví dụ: `authController.js` có `login`, `register`, `changePassword`

```javascript
// Ví dụ:
export const register = async (req, res) => {
  const { fullName, email, password } = req.body;
  // Validate, hash password, gọi User.create()
  const newUser = await User.create(...);
  res.json({ user: newUser });
};
```

### **Routes (R) - src/routes/**
- Định nghĩa API endpoints
- Kết nối HTTP methods với Controllers
- Xuất phát từ `/api`

```javascript
// Ví dụ:
router.post('/register', register);
router.get('/me', authMiddleware, getMe);
```

**Cấu trúc URL:**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/courses
GET    /api/courses
GET    /api/courses/:id
GET    /api/enrollments/my-courses
...
```

## 🔐 Authentication (JWT Token)

Hệ thống sử dụng **JWT (JSON Web Token)** để xác thực.

### Dòng chảy:
1. User đăng nhập → Controller nhận request
2. Verify email/password → Tạo JWT token
3. Frontend lưu token → Gửi token ở header `Authorization: Bearer <token>`
4. Backend verify token → Cho phép truy cập protected resources

### Protected Routes:
Cần gửi header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🛡️ Authorization (Quyền Truy Cập)

### Các Role:
- **student**: Học khóa học, xem progress
- **instructor**: Tạo & quản lý khóa học của mình
- **admin**: Quản lý toàn bộ hệ thống

### Middleware:
```javascript
authMiddleware      // Kiểm tra token có hợp lệ
adminMiddleware     // Chỉ admin
instructorMiddleware // Instructor hoặc admin
```

## 📡 API Endpoints

### **Authentication**
```
POST   /api/auth/register           - Đăng ký
POST   /api/auth/login              - Đăng nhập
GET    /api/auth/me                 - Lấy thông tin user hiện tại
POST   /api/auth/change-password    - Đổi mật khẩu
```

### **Users (Admin)**
```
GET    /api/users                   - Lấy tất cả users (phân trang)
GET    /api/users/:id               - Lấy user theo ID
PUT    /api/users/:id               - Cập nhật user
DELETE /api/users/:id               - Xóa user
POST   /api/users/:id/reset-password - Reset password
```

### **Categories (Admin)**
```
GET    /api/categories              - Lấy tất cả categories
GET    /api/categories/:id          - Lấy category theo ID
POST   /api/categories              - Tạo category mới
PUT    /api/categories/:id          - Cập nhật category
DELETE /api/categories/:id          - Xóa category
```

### **Courses**
```
GET    /api/courses                 - Lấy tất cả courses (public)
GET    /api/courses/:id             - Lấy course chi tiết
GET    /api/courses/by-category/:categoryId - Filter by category
POST   /api/courses                 - Tạo course mới (instructor)
PUT    /api/courses/:id             - Cập nhật course (instructor)
DELETE /api/courses/:id             - Xóa course (instructor)
```

### **Lessons**
```
GET    /api/lessons/course/:courseId      - Lấy lessons của course
GET    /api/lessons/:id                   - Lấy lesson chi tiết
GET    /api/lessons/page/next?courseId=1&lessonOrder=1 - Lesson tiếp theo
POST   /api/lessons                       - Tạo lesson mới
PUT    /api/lessons/:id                   - Cập nhật lesson
DELETE /api/lessons/:id                   - Xóa lesson
```

### **Enrollments (Đăng ký khóa học)**
```
POST   /api/enrollments              - Đăng ký khóa học
GET    /api/enrollments/my-courses   - Lấy courses đã đăng ký
GET    /api/enrollments/course/:courseId/students - Danh sách students (instructor)
DELETE /api/enrollments/:courseId    - Hủy đăng ký
PATCH  /api/enrollments/:enrollmentId/status - Cập nhật status
GET    /api/enrollments/check/enrollment?courseId=1 - Kiểm tra đã đăng ký
```

### **Progress (Theo dõi học tập)**
```
POST   /api/progress                 - Cập nhật progress
GET    /api/progress/course/:courseId - Tiến độ trong course
GET    /api/progress/my-progress     - Tất cả tiến độ
GET    /api/progress/check/lesson?lessonId=1 - Check hoàn thành
GET    /api/progress/stats/:courseId - Thống kê (instructor)
```

## 🔍 Database Schema

### Users
```sql
id, full_name, email, password, role (student/instructor/admin), created_at
```

### Courses
```sql
id, title, description, thumbnail, instructor_id, category_id, created_at
```

### Lessons
```sql
id, course_id, title, video_url, lesson_order
```

### Enrollments
```sql
id, user_id, course_id, enrolled_at, status (active/completed)
```

### Progress
```sql
id, user_id, lesson_id, completed (boolean), completed_at
```

## 📝 Ví dụ Request/Response

### Đăng ký
```javascript
// Request
POST /api/auth/register
{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@email.com",
  "password": "password123",
  "confirmPassword": "password123"
}

// Response
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

### Đăng nhập
```javascript
// Request
POST /api/auth/login
{
  "email": "nguyenvana@email.com",
  "password": "password123"
}

// Response
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

### Tạo Course
```javascript
// Request
POST /api/courses
Authorization: Bearer <token>
{
  "title": "React & TypeScript",
  "description": "Khóa học React",
  "thumbnail": "https://...",
  "categoryId": 1
}

// Response
{
  "message": "Tạo khóa học thành công",
  "course": {
    "id": 1,
    "title": "React & TypeScript",
    "description": "Khóa học React",
    "thumbnail": "https://...",
    "instructor_id": 5,
    "category_id": 1,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## ⚠️ Lỗi Phổ Biến

| Error | Nguyên nhân | Giải pháp |
|-------|-----------|----------|
| `connect ECONNREFUSED` | PostgreSQL chưa chạy | Chạy PostgreSQL service |
| `relation "users" does not exist` | Chưa chạy setup-db | Chạy `npm run setup-db` |
| `ENOENT: no such file or directory, open '.env'` | Missing .env file | Tạo .env từ .env.example |
| `401 Unauthorized` | Token không hợp lệ | Kiểm tra token trong header |
| `403 Forbidden` | Không có quyền | Kiểm tra role của user |

## 🆘 Troubleshooting

### 1. **Kết nối Database bị lỗi**
```bash
# Kiểm tra PostgreSQL đang chạy
psql -U postgres

# Kiểm tra credentials trong .env
```

### 2. **Port 3000 đã được sử dụng**
```bash
# Tìm process sử dụng port 3000 (Windows)
netstat -ano | findstr :3000

# Chọn port khác trong .env
PORT=3001
```

### 3. **Module not found errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Tiếp Theo

1. ✅ Kết nối Frontend với Backend API
2. ✅ Thêm upload file ảnh (multer)
3. ✅ Thêm email notification
4. ✅ Thêm payment integration (nếu cần)
5. ✅ Deploy lên production

## 📞 Hỗ Trợ

Liên hệ: [contact@example.com]
