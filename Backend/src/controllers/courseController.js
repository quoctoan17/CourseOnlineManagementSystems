import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import pool from '../config/database.js';

export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, price, status } = req.body;
    const categoryId = req.body.categoryId ?? req.body.category_id;
    const instructorId = req.user.id;
    if (!title || !description) return res.status(400).json({ error: 'Vui lòng điền đủ thông tin' });

    // Khi tạo mới luôn là draft — tránh course rỗng bị public ngay
    const safeStatus = status === 'published' ? 'draft' : (status || 'draft');

    const course = await Course.create(
      title, description, thumbnail || null,
      instructorId, categoryId || null,
      price || 0, safeStatus
    );
    res.status(201).json({ message: 'Tạo khóa học thành công', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Chỉ trả về course đang published — ẩn draft & archived khỏi danh sách public
export const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const courses = await Course.findAll(limit, offset);
    const total = await Course.count();
    res.json({
      data: courses,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });
    res.json({ course });
  } catch (error) {
    console.error('Get course by id error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const getPopularCourses = async (req, res) => {
  try {
    // Chỉ lấy course published
    const query = `
      SELECT 
        c.id, c.title, c.description, c.thumbnail, c.slug, c.price,
        u.full_name as instructor_name,
        cat.name as category_name,
        COUNT(DISTINCT e.user_id) as student_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.status = 'published'
      GROUP BY c.id, u.full_name, cat.name
      ORDER BY student_count DESC
      LIMIT 5
    `;
    const result = await pool.query(query);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Get popular courses error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findBySlug(slug);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });

    // Ẩn course archived khỏi public — trừ student đã enrolled (xử lý ở FE)
    // Vẫn trả về để student đã enrolled có thể tiếp tục học,
    // FE sẽ dùng course.status để hiển thị thông báo phù hợp
    const totalDuration = await Lesson.getTotalDuration(course.id);
    course.duration = totalDuration;

    const lessonCountResult = await pool.query(
      'SELECT COUNT(*) FROM lessons WHERE course_id = $1',
      [course.id]
    );
    course.lesson_count = parseInt(lessonCountResult.rows[0].count, 10);

    res.json({ course });
  } catch (error) {
    console.error('Get course by slug error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const courses = await Course.findByInstructor(instructorId, limit, offset);
    res.json({ data: courses, pagination: { page, limit, total: courses.length } });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const getCoursesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const courses = await Course.findByCategory(categoryId, limit, offset);
    const total = courses.length;
    res.json({ data: courses, pagination: { page, limit }, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get courses by category error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail, price } = req.body;
    const categoryId = req.body.categoryId ?? req.body.category_id;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });
    if (course.status === 'archived') return res.status(400).json({ error: 'Không thể chỉnh sửa khóa học đã ngưng' });
    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id)
      return res.status(403).json({ error: 'Không có quyền cập nhật' });
    if (!title || !description) return res.status(400).json({ error: 'Vui lòng điền đủ thông tin' });
    const updatedCourse = await Course.update(
      id, title, description,
      thumbnail !== undefined ? thumbnail : course.thumbnail,
      categoryId || course.category_id,
      price !== undefined ? parseInt(price) || 0 : course.price
    );
    res.json({ message: 'Cập nhật khóa học thành công', course: updatedCourse });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// ── SOFT DELETE: chuyển status = 'archived' thay vì DELETE thật ──────────────
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });
    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id)
      return res.status(403).json({ error: 'Không có quyền xóa' });
    if (course.status === 'archived')
      return res.status(400).json({ error: 'Khóa học đã được ngưng trước đó' });

    await Course.updateStatus(id, 'archived');

    res.json({ message: 'Đã ngưng khóa học thành công. Học viên đã đăng ký vẫn tiếp tục học bình thường.' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// ── PATCH /:id/status ─────────────────────────────────────────────────────────
export const updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'inactive', 'published', 'draft', 'archived'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: 'Status không hợp lệ' });

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });

    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id)
      return res.status(403).json({ error: 'Không có quyền cập nhật' });

    // Không cho published nếu chưa có lesson
    if (status === 'published') {
      const result = await pool.query(
        'SELECT COUNT(*) FROM lessons WHERE course_id = $1',
        [id]
      );
      const lessonCount = parseInt(result.rows[0].count, 10);
      if (lessonCount === 0) {
        return res.status(400).json({
          error: 'Khóa học phải có ít nhất 1 bài học trước khi công bố',
        });
      }
    }

    const updatedCourse = await Course.updateStatus(id, status);
    res.json({ message: 'Cập nhật trạng thái thành công', course: updatedCourse });
  } catch (error) {
    console.error('Update course status error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};