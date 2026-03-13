import pool from '../config/database.js';

class Progress {
  // Tạo hoặc cập nhật progress
  static async upsert(userId, lessonId, completed) {
    const query = `
      INSERT INTO progress (user_id, lesson_id, completed, completed_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET completed = $3, completed_at = $4
      RETURNING id, user_id, lesson_id, completed, completed_at
    `;
    const completedAt = completed ? new Date() : null;
    const result = await pool.query(query, [userId, lessonId, completed, completedAt]);
    return result.rows[0];
  }

  // Lấy progress của student
  static async findByUserAndLesson(userId, lessonId) {
    const query = `
      SELECT id, user_id, lesson_id, completed, completed_at
      FROM progress
      WHERE user_id = $1 AND lesson_id = $2
    `;
    const result = await pool.query(query, [userId, lessonId]);
    return result.rows[0];
  }

  // Lấy tiến độ của student trong một course
  static async findStudentProgress(userId, courseId) {
    const query = `
      SELECT 
        l.id, l.title, l.lesson_order,
        p.completed, p.completed_at
      FROM lessons l
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = $1
      WHERE l.course_id = $2
      ORDER BY l.lesson_order ASC
    `;
    const result = await pool.query(query, [userId, courseId]);
    return result.rows;
  }

  // Lấy tổng tiến độ (%)
  static async getStudentProgressPercentage(userId, courseId) {
    const query = `
      SELECT 
        COUNT(l.id) as total_lessons,
        COUNT(CASE WHEN p.completed = true THEN 1 END) as completed_lessons,
        ROUND(
          (COUNT(CASE WHEN p.completed = true THEN 1 END) * 100.0 / 
          NULLIF(COUNT(l.id), 0))::numeric, 
          2
        ) as progress_percentage
      FROM lessons l
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = $1
      WHERE l.course_id = $2
    `;
    const result = await pool.query(query, [userId, courseId]);
    return result.rows[0];
  }

  // Lấy tất cả progress của một user
  static async findByUser(userId) {
    const query = `
      SELECT 
        p.id, p.user_id, p.lesson_id, p.completed, p.completed_at,
        l.title as lesson_title, l.course_id,
        c.title as course_title
      FROM progress p
      JOIN lessons l ON p.lesson_id = l.id
      JOIN courses c ON l.course_id = c.id
      WHERE p.user_id = $1
      ORDER BY p.completed_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Xóa progress
  static async delete(id) {
    const query = 'DELETE FROM progress WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Progress;
