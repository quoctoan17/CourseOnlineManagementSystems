import pool from '../config/database.js';

class Category {
  static async create(name, description) {
    const query = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description
    `;
    const result = await pool.query(query, [name, description]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Lấy tất cả categories kèm course_count
  static async findAll() {
    const query = `
      SELECT c.*, COUNT(co.id)::int AS course_count
      FROM categories c
      LEFT JOIN courses co ON co.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

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

  static async delete(id) {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Category;