import pool from '../config/database.js';

class Category {
  // Tạo category mới
  static async create(name, description) {
    const query = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description
    `;
    const result = await pool.query(query, [name, description]);
    return result.rows[0];
  }

  // Lấy category theo ID
  static async findById(id) {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Lấy tất cả categories
  static async findAll() {
    const query = 'SELECT * FROM categories ORDER BY name ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Cập nhật category
  static async update(id, name, description) {
    const query = `
      UPDATE categories 
      SET name = $1, description = $2
      WHERE id = $3
      RETURNING id, name, description
    `;
    const result = await pool.query(query, [name, description, id]);
    return result.rows[0];
  }

  // Xóa category
  static async delete(id) {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Category;
