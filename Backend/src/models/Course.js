import pool from '../config/database.js';

// Tạo slug từ tiêu đề
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu tiếng Việt
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

class Course {
  // Tạo course mới
  static async create(title, description, thumbnail, instructorId, categoryId, price = 0, status = 'published') {
    const baseSlug = generateSlug(title);

    // Kiểm tra trùng slug, nếu trùng thì thêm -2, -3, ...
    let slug = baseSlug;
    let counter = 2;
    while (true) {
      const check = await pool.query('SELECT id FROM courses WHERE slug = $1', [slug]);
      if (check.rows.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const query = `
      INSERT INTO courses (title, description, thumbnail, instructor_id, category_id, price, status, slug)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, description, thumbnail, instructor_id, category_id, price, status, slug, created_at
    `;
    const result = await pool.query(query, [title, description, thumbnail, instructorId, categoryId, price, status, slug]);
    return result.rows[0];
  }

  // Lấy course theo ID
  static async findById(id) {
    const query = `
      SELECT 
        c.id, c.title, c.description, c.thumbnail, c.instructor_id, c.category_id, c.created_at, c.slug,
        u.full_name as instructor_name, u.email as instructor_email,
        cat.name as category_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Lấy course theo slug
  static async findBySlug(slug) {
    const query = `
      SELECT 
        c.id, c.title, c.description, c.thumbnail, c.instructor_id, c.category_id, c.created_at, c.slug,
        u.full_name as instructor_name, u.email as instructor_email,
        cat.name as category_name,
        COUNT(DISTINCT e.user_id) as student_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.slug = $1
      GROUP BY c.id, u.full_name, u.email, cat.name
    `;
    const result = await pool.query(query, [slug]);
    return result.rows[0];
  }

  // Lấy tất cả courses với phân trang
  static async findAll(limit = 10, offset = 0) {
    const query = `
      SELECT 
        c.id, c.title, c.description, c.thumbnail, c.instructor_id, c.category_id, c.status, c.price, c.created_at, c.slug,
        u.full_name as instructor_name,
        cat.name as category_name,
        COUNT(DISTINCT e.user_id) as student_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id, u.full_name, cat.name
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Tìm courses theo instructor
  static async findByInstructor(instructorId, limit = 10, offset = 0) {
    const query = `
      SELECT 
        c.id, c.title, c.description, c.thumbnail, c.instructor_id, c.category_id, c.created_at, c.slug,
        u.full_name as instructor_name,
        cat.name as category_name,
        COUNT(DISTINCT e.user_id) as student_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.instructor_id = $1
      GROUP BY c.id, u.full_name, cat.name
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [instructorId, limit, offset]);
    return result.rows;
  }

  // Tìm courses theo category
  static async findByCategory(categoryId, limit = 10, offset = 0) {
    const query = `
      SELECT 
        c.id, c.title, c.description, c.thumbnail, c.instructor_id, c.category_id, c.created_at, c.slug,
        u.full_name as instructor_name,
        cat.name as category_name,
        COUNT(DISTINCT e.user_id) as student_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.category_id = $1
      GROUP BY c.id, u.full_name, cat.name
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [categoryId, limit, offset]);
    return result.rows;
  }

  // Lấy tổng số courses
  static async count() {
    const query = 'SELECT COUNT(*) as count FROM courses';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  // Cập nhật course
  static async update(id, title, description, thumbnail, categoryId) {
    const query = `
      UPDATE courses 
      SET title = $1, description = $2, thumbnail = $3, category_id = $4
      WHERE id = $5
      RETURNING id, title, description, thumbnail, instructor_id, category_id, status, slug, created_at
    `;
    const result = await pool.query(query, [title, description, thumbnail, categoryId, id]);
    return result.rows[0];
  }

  // Cập nhật course status
  static async updateStatus(id, status) {
    const query = `
      UPDATE courses 
      SET status = $1
      WHERE id = $2
      RETURNING id, title, status, slug, created_at
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  // Xóa course
  static async delete(id) {
    const query = 'DELETE FROM courses WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Course;