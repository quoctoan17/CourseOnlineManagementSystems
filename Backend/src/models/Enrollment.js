import pool from '../config/database.js';

class Enrollment {
  static async create(userId, courseId) {
    const query = `
      INSERT INTO enrollments (user_id, course_id, status)
      VALUES ($1, $2, 'active')
      RETURNING id, user_id, course_id, enrolled_at, status
    `;
    const result = await pool.query(query, [userId, courseId]);
    return result.rows[0];
  }

  static async countByUser(userId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM enrollments WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  static async findByUserAndCourse(userId, courseId) {
    const result = await pool.query(
      `SELECT id, user_id, course_id, enrolled_at, status, has_new_lessons, completed_at
       FROM enrollments WHERE user_id = $1 AND course_id = $2`,
      [userId, courseId]
    );
    return result.rows[0];
  }

  // Lấy tất cả courses của một student — thêm has_new_lessons + completed_at
  static async findStudentCourses(userId, limit = 10, offset = 0) {
  const query = `
    SELECT 
      c.id, c.title, c.description, c.thumbnail, c.slug, c.status as course_status,
      c.instructor_id, c.category_id, c.created_at,
      u.full_name as instructor_name,
      cat.name as category_name,
      e.enrolled_at, e.status,
      e.has_new_lessons,
      e.completed_at,
      COUNT(l.id) as total_lessons,
      COUNT(CASE WHEN p.completed = true THEN 1 END) as completed_lessons,
      COALESCE(SUM(l.duration), 0) as total_duration_seconds,
      COALESCE(SUM(CASE WHEN p.completed = true THEN l.duration ELSE 0 END), 0) as completed_duration_seconds
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    LEFT JOIN users u ON c.instructor_id = u.id
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN lessons l ON c.id = l.course_id
    LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = e.user_id
    WHERE e.user_id = $1
    GROUP BY c.id, u.full_name, cat.name, e.enrolled_at, e.status, e.has_new_lessons, e.completed_at
    ORDER BY e.enrolled_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
}

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

  static async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE enrollments SET status = $1 WHERE id = $2
       RETURNING id, user_id, course_id, enrolled_at, status`,
      [status, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM enrollments WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

export default Enrollment;