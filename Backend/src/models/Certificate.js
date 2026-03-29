import pool from '../config/database.js';

const Certificate = {
  // Cấp chứng chỉ (upsert — tránh duplicate)
  async issue(userId, courseId, studentName, courseTitle) {
    const result = await pool.query(
      `INSERT INTO certificates (user_id, course_id, student_name, course_title)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, course_id) DO NOTHING
       RETURNING *`,
      [userId, courseId, studentName, courseTitle]
    );
    return result.rows[0] || null; // null nếu đã có rồi
  },

  // Lấy chứng chỉ của student trong 1 course
  async findByUserAndCourse(userId, courseId) {
    const result = await pool.query(
      `SELECT c.*, u.full_name as student_name, co.title as course_title
       FROM certificates c
       JOIN users u ON c.user_id = u.id
       JOIN courses co ON c.course_id = co.id
       WHERE c.user_id = $1 AND c.course_id = $2`,
      [userId, courseId]
    );
    return result.rows[0] || null;
  },

  // Lấy tất cả chứng chỉ của 1 student
  async findByUser(userId) {
    const result = await pool.query(
      `SELECT c.*, co.title as course_title, co.thumbnail, u.full_name as student_name
       FROM certificates c
       JOIN courses co ON c.course_id = co.id
       JOIN users u ON c.user_id = u.id
       WHERE c.user_id = $1
       ORDER BY c.issued_at DESC`,
      [userId]
    );
    return result.rows;
  },
};

export default Certificate;