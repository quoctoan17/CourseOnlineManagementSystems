import pool from '../config/database.js';

class Payment {
  static async create(userId, courseId, amount) {
    const query = `
      INSERT INTO payments (user_id, course_id, amount, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `;
    const result = await pool.query(query, [userId, courseId, amount]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE payments SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUserAndCourse(userId, courseId) {
    const result = await pool.query(
      `SELECT * FROM payments WHERE user_id = $1 AND course_id = $2 AND status = 'success'`,
      [userId, courseId]
    );
    return result.rows[0];
  }
}

export default Payment;