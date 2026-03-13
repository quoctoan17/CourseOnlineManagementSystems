import pool from '../config/database.js';

class Lesson {
  static async create(courseId, title, videoUrl, lessonOrder, duration = null) {
    const query = `
      INSERT INTO lessons (course_id, title, video_url, lesson_order, duration)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, course_id, title, video_url, lesson_order, duration
    `;
    const result = await pool.query(query, [courseId, title, videoUrl, lessonOrder, duration]);
    return result.rows[0];
  }

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

  static async findByCourse(courseId) {
    const query = `
      SELECT id, course_id, title, video_url, lesson_order, duration
      FROM lessons
      WHERE course_id = $1
      ORDER BY lesson_order ASC
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows;
  }

  // Tính tổng duration của course (format: "Xh Ym")
  static async getTotalDuration(courseId) {
    const query = `
      SELECT duration FROM lessons
      WHERE course_id = $1 AND duration IS NOT NULL
    `;
    const result = await pool.query(query, [courseId]);
    let totalSeconds = 0;
    for (const row of result.rows) {
      // Parse "MM:SS" hoặc "HH:MM:SS"
      const parts = row.duration.split(':').map(Number);
      if (parts.length === 2) totalSeconds += parts[0] * 60 + parts[1];
      else if (parts.length === 3) totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (totalSeconds === 0) return null;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m} phút`;
  }

  static async update(id, title, videoUrl, lessonOrder, duration = null) {
    const query = `
      UPDATE lessons 
      SET title = $1, video_url = $2, lesson_order = $3, duration = $4
      WHERE id = $5
      RETURNING id, course_id, title, video_url, lesson_order, duration
    `;
    const result = await pool.query(query, [title, videoUrl, lessonOrder, duration, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM lessons WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getNextLesson(courseId, currentLessonOrder) {
    const query = `
      SELECT id, course_id, title, video_url, lesson_order, duration
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