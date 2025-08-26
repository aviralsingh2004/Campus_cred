const pool = require('../config/database');

class Reward {
  static async create({ name, description, points_cost, category, stock_quantity = -1 }) {
    const result = await pool.query(
      `INSERT INTO rewards (name, description, points_cost, category, stock_quantity) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, description, points_cost, category, stock_quantity]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM rewards WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findAll(available_only = false) {
    let query = 'SELECT * FROM rewards';
    const params = [];
    
    if (available_only) {
      query += ' WHERE is_available = true AND (stock_quantity > 0 OR stock_quantity = -1)';
    }
    
    query += ' ORDER BY points_cost ASC, name ASC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findByCategory(category) {
    const result = await pool.query(
      'SELECT * FROM rewards WHERE category = $1 AND is_available = true ORDER BY points_cost ASC',
      [category]
    );
    return result.rows;
  }

  static async updateStock(id, new_stock) {
    const result = await pool.query(
      'UPDATE rewards SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [new_stock, id]
    );
    return result.rows[0];
  }

  static async decrementStock(id) {
    const result = await pool.query(
      `UPDATE rewards 
       SET stock_quantity = CASE 
         WHEN stock_quantity > 0 THEN stock_quantity - 1 
         ELSE stock_quantity 
       END,
       updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND (stock_quantity > 0 OR stock_quantity = -1)
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async toggleAvailability(id) {
    const result = await pool.query(
      'UPDATE rewards SET is_available = NOT is_available, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async getCategories() {
    const result = await pool.query(
      'SELECT DISTINCT category FROM rewards WHERE category IS NOT NULL AND is_available = true ORDER BY category'
    );
    return result.rows.map(row => row.category);
  }

  static async getPopularRewards(limit = 10) {
    const result = await pool.query(
      `SELECT r.*, COUNT(red.id) as redemption_count
       FROM rewards r
       LEFT JOIN redemptions red ON r.id = red.reward_id
       WHERE r.is_available = true
       GROUP BY r.id
       ORDER BY redemption_count DESC, r.points_cost ASC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

module.exports = Reward;
