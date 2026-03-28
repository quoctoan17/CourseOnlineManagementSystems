import pool from '../config/database.js';

class User {
  // Tạo user mới
  static async create(fullName, email, hashedPassword, role = 'student') {
    const query = `INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role, created_at`;
    const result = await pool.query(query, [fullName, email, hashedPassword, role]);
    return result.rows[0];
  }

  // Lấy user theo email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Lấy user theo ID
  static async findById(id) {
    const query = `
      SELECT id, full_name, email, role, created_at 
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Lấy tất cả users (phân trang)
  static async findAll(limit = 10, offset = 0) {
    const query = `
      SELECT id, full_name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  // Lấy tổng số users
  static async count() {
    const query = 'SELECT COUNT(*) as count FROM users';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  // Cập nhật user
  static async update(id, fullName, email, role) {
    const query = `
      UPDATE users 
      SET full_name = $1, email = $2, role = $3
      WHERE id = $4
      RETURNING id, full_name, email, role, created_at
    `;
    const result = await pool.query(query, [fullName, email, role, id]);
    return result.rows[0];
  }

  // Cập nhật password
  static async updatePassword(id, hashedPassword) {
    const query = `
      UPDATE users 
      SET password = $1
      WHERE id = $2
      RETURNING id, full_name, email, role
    `;
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rows[0];
  }

  // Xóa user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default User;
