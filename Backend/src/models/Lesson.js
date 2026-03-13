import pool from '../config/database.js';

class Lesson {
  // Tạo lesson mới
  static async create(courseId, title, videoUrl, lessonOrder) {
    const query = `
      INSERT INTO lessons (course_id, title, video_url, lesson_order)
      VALUES ($1, $2, $3, $4)
      RETURNING id, course_id, title, video_url, lesson_order
    `;
    const result = await pool.query(query, [courseId, title, videoUrl, lessonOrder]);
    return result.rows[0];
  }

  // Lấy lesson theo ID
  static async findById(id) {
    const query = `
      SELECT l.*, c.title as course_title
      FROM lessons l
      LEFT JOIN courses c ON l.course_id = c.id
      WHERE l.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Lấy tất cả lessons trong một course
  static async findByCourse(courseId) {
    const query = `
      SELECT id, course_id, title, video_url, lesson_order
      FROM lessons
      WHERE course_id = $1
      ORDER BY lesson_order ASC
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows;
  }

  // Cập nhật lesson
  static async update(id, title, videoUrl, lessonOrder) {
    const query = `
      UPDATE lessons 
      SET title = $1, video_url = $2, lesson_order = $3
      WHERE id = $4
      RETURNING id, course_id, title, video_url, lesson_order
    `;
    const result = await pool.query(query, [title, videoUrl, lessonOrder, id]);
    return result.rows[0];
  }

  // Xóa lesson
  static async delete(id) {
    const query = 'DELETE FROM lessons WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Lấy lesson tiếp theo
  static async getNextLesson(courseId, currentLessonOrder) {
    const query = `
      SELECT id, course_id, title, video_url, lesson_order
      FROM lessons
      WHERE course_id = $1 AND lesson_order > $2
      ORDER BY lesson_order ASC
      LIMIT 1
    `;
    const result = await pool.query(query, [courseId, currentLessonOrder]);
    return result.rows[0];
  }
}

export default Lesson;
