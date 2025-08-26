const pool = require('../config/database');

class Redemption {
  static async create({ user_id, reward_id, points_spent }) {
    const result = await pool.query(
      `INSERT INTO redemptions (user_id, reward_id, points_spent) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [user_id, reward_id, points_spent]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT red.*, r.name as reward_name, r.description as reward_description,
              u.first_name, u.last_name, u.student_id
       FROM redemptions red
       JOIN rewards r ON red.reward_id = r.id
       JOIN users u ON red.user_id = u.id
       WHERE red.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByUserId(user_id, limit = 20, offset = 0) {
    const result = await pool.query(
      `SELECT red.*, r.name as reward_name, r.description as reward_description
       FROM redemptions red
       JOIN rewards r ON red.reward_id = r.id
       WHERE red.user_id = $1 
       ORDER BY red.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );
    
    return result.rows;
  }

  static async getAllRedemptions(limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT red.*, 
              r.name as reward_name, r.description as reward_description,
              u.first_name, u.last_name, u.student_id
       FROM redemptions red
       JOIN rewards r ON red.reward_id = r.id
       JOIN users u ON red.user_id = u.id
       ORDER BY red.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE redemptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  static async getPendingRedemptions() {
    const result = await pool.query(
      `SELECT red.*, 
              r.name as reward_name, r.description as reward_description,
              u.first_name, u.last_name, u.student_id, u.email
       FROM redemptions red
       JOIN rewards r ON red.reward_id = r.id
       JOIN users u ON red.user_id = u.id
       WHERE red.status = 'pending'
       ORDER BY red.created_at ASC`
    );
    
    return result.rows;
  }

  static async getRedemptionStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_redemptions,
        SUM(points_spent) as total_points_spent,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(DISTINCT user_id) as unique_redeemers
      FROM redemptions 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);
    
    return result.rows[0];
  }
}

module.exports = Redemption;
