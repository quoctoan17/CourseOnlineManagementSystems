import pool from '../config/database.js';

class Enrollment {
  // Tạo enrollment mới
  static async create(userId, courseId) {
    const query = `
      INSERT INTO enrollments (user_id, course_id, status)
      VALUES ($1, $2, 'active')
      RETURNING id, user_id, course_id, enrolled_at, status
    `;
    const result = await pool.query(query, [userId, courseId]);
    return result.rows[0];
  }

  // Đếm số khóa học của user
  static async countByUser(userId) {
    const query = `
      SELECT COUNT(*) as count FROM enrollments WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  // Kiểm tra enrollment có tồn tại
  static async findByUserAndCourse(userId, courseId) {
    const query = `
      SELECT id, user_id, course_id, enrolled_at, status
      FROM enrollments
      WHERE user_id = $1 AND course_id = $2
    `;
    const result = await pool.query(query, [userId, courseId]);
    return result.rows[0];
  }

  // Lấy tất cả courses của một student
  static async findStudentCourses(userId, limit = 10, offset = 0) {
    const query = `
      SELECT 
        c.id, c.title, c.description, c.thumbnail, c.instructor_id, c.category_id, c.created_at,
        u.full_name as instructor_name,
        cat.name as category_name,
        e.enrolled_at, e.status,
        COUNT(l.id) as total_lessons,
        COUNT(CASE WHEN p.completed = true THEN 1 END) as completed_lessons,
        SUM(
          CASE 
            WHEN l.duration IS NOT NULL AND l.duration ~ '^\d+:\d+$'
            THEN (SPLIT_PART(l.duration, ':', 1)::int * 60 + SPLIT_PART(l.duration, ':', 2)::int)
            ELSE 0
          END
        ) as total_duration_seconds,
        SUM(
          CASE 
            WHEN p.completed = true AND l.duration IS NOT NULL AND l.duration ~ '^\d+:\d+$'
            THEN (SPLIT_PART(l.duration, ':', 1)::int * 60 + SPLIT_PART(l.duration, ':', 2)::int)
            ELSE 0
          END
        ) as completed_duration_seconds
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN lessons l ON c.id = l.course_id
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = e.user_id
      WHERE e.user_id = $1
      GROUP BY c.id, u.full_name, cat.name, e.enrolled_at, e.status
      ORDER BY e.enrolled_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  // Lấy tất cả students của một course
  static async findCourseStudents(courseId, limit = 10, offset = 0) {
    const query = `
      SELECT 
        u.id, u.full_name, u.email, u.role,
        e.enrolled_at, e.status,
        COUNT(l.id) as total_lessons,
        COUNT(CASE WHEN p.completed = true THEN 1 END) as completed_lessons
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN lessons l ON e.course_id = l.course_id
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = e.user_id
      WHERE e.course_id = $1
      GROUP BY u.id, e.enrolled_at, e.status
      ORDER BY e.enrolled_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [courseId, limit, offset]);
    return result.rows;
  }

  // Cập nhật status enrollment
  static async updateStatus(id, status) {
    const query = `
      UPDATE enrollments 
      SET status = $1
      WHERE id = $2
      RETURNING id, user_id, course_id, enrolled_at, status
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  // Xóa enrollment
  static async delete(id) {
    const query = 'DELETE FROM enrollments WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Enrollment;
