const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, first_name, last_name, role = 'student', student_id }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, student_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, first_name, last_name, role, student_id, points_balance, created_at`,
      [email, hashedPassword, first_name, last_name, role, student_id]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, student_id, points_balance, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByStudentId(student_id) {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, student_id, points_balance, created_at FROM users WHERE student_id = $1',
      [student_id]
    );
    return result.rows[0];
  }

  static async updatePointsBalance(userId, newBalance) {
    const result = await pool.query(
      'UPDATE users SET points_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING points_balance',
      [newBalance, userId]
    );
    return result.rows[0];
  }

  static async getAllStudents() {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, student_id, points_balance, created_at 
       FROM users WHERE role = 'student' ORDER BY created_at DESC`
    );
    return result.rows;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
