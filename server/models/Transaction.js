const pool = require('../config/database');

class Transaction {
  static async create({ user_id, transaction_type, amount, reason, reward_id = null, admin_id = null }) {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, transaction_type, amount, reason, reward_id, admin_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [user_id, transaction_type, amount, reason, reward_id, admin_id]
    );
    
    return result.rows[0];
  }

  static async findByUserId(user_id, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT t.*, r.name as reward_name, 
              u.first_name as admin_first_name, u.last_name as admin_last_name
       FROM transactions t
       LEFT JOIN rewards r ON t.reward_id = r.id
       LEFT JOIN users u ON t.admin_id = u.id
       WHERE t.user_id = $1 
       ORDER BY t.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );
    
    return result.rows;
  }

  static async getPointsHistory(user_id) {
    const result = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END) as credits,
        SUM(CASE WHEN transaction_type IN ('debit', 'redemption') THEN amount ELSE 0 END) as debits,
        COUNT(*) as transaction_count
       FROM transactions 
       WHERE user_id = $1 
       GROUP BY DATE(created_at) 
       ORDER BY date DESC 
       LIMIT 30`,
      [user_id]
    );
    
    return result.rows;
  }

  static async getAllTransactions(limit = 100, offset = 0) {
    const result = await pool.query(
      `SELECT t.*, 
              u.first_name, u.last_name, u.student_id,
              r.name as reward_name,
              admin.first_name as admin_first_name, admin.last_name as admin_last_name
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN rewards r ON t.reward_id = r.id
       LEFT JOIN users admin ON t.admin_id = admin.id
       ORDER BY t.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }

  static async getTransactionStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END) as total_credits,
        SUM(CASE WHEN transaction_type IN ('debit', 'redemption') THEN amount ELSE 0 END) as total_debits,
        COUNT(DISTINCT user_id) as active_users
      FROM transactions 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);
    
    return result.rows[0];
  }
}

module.exports = Transaction;
