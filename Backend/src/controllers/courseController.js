import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import pool from '../config/database.js';

export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, price, status } = req.body;
    const categoryId = req.body.categoryId ?? req.body.category_id;
    const instructorId = req.user.id;
    if (!title || !description) return res.status(400).json({ error: 'Vui lòng điền đủ thông tin' });
    const course = await Course.create(title, description, thumbnail || null, instructorId, categoryId || null, price || 0, status || 'published');
    res.status(201).json({ message: 'Tạo khóa học thành công', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const courses = await Course.findAll(limit, offset);
    const total = await Course.count();
    res.json({ data: courses, pagination: { total, page, limit, pages: Math.ceil(total / limit) }, totalPages: Math.ceil(total / limit) });
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

// courseController.js — thêm hàm này
export const getPopularCourses = async (req, res) => {
  try {
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

// LẤY COURSE THEO SLUG — kèm tổng duration
export const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findBySlug(slug);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });

    // Tính tổng thời lượng từ các lessons
    const totalDuration = await Lesson.getTotalDuration(course.id);
    course.duration = totalDuration;

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
    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id) return res.status(403).json({ error: 'Không có quyền cập nhật' });
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

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });
    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id) return res.status(403).json({ error: 'Không có quyền xóa' });
    await Course.delete(id);
    res.json({ message: 'Xóa khóa học thành công' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

export const updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['active', 'inactive', 'published', 'draft'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Status không hợp lệ' });
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: 'Khóa học không tồn tại' });
    if (req.user.role !== 'admin' && req.user.id !== course.instructor_id) return res.status(403).json({ error: 'Không có quyền cập nhật' });
    const updatedCourse = await Course.updateStatus(id, status);
    res.json({ message: 'Cập nhật trạng thái thành công', course: updatedCourse });
  } catch (error) {
    console.error('Update course status error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};