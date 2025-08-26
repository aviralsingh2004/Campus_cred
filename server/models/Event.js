const pool = require('../config/database');

class Event {
  static async findAll(whereConditions = {}) {
    let query = `
      SELECT e.*, 
        COUNT(er.id) as registration_count,
        CASE 
          WHEN e.max_participants IS NULL THEN NULL
          ELSE e.max_participants - COUNT(er.id)
        END as available_spots
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id AND er.registration_status = 'registered'
    `;
    
    const conditions = [];
    const values = [];
    let valueIndex = 1;
    
    if (whereConditions.is_active !== undefined) {
      conditions.push(`e.is_active = $${valueIndex}`);
      values.push(whereConditions.is_active);
      valueIndex++;
    }
    
    if (whereConditions.category && whereConditions.category !== 'all') {
      conditions.push(`e.category = $${valueIndex}`);
      values.push(whereConditions.category);
      valueIndex++;
    }
    
    if (whereConditions.is_featured !== undefined) {
      conditions.push(`e.is_featured = $${valueIndex}`);
      values.push(whereConditions.is_featured);
      valueIndex++;
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += `
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `;
    
    const result = await pool.query(query, values);
    return result.rows;
  }
  
  static async findById(id) {
    const query = `
      SELECT e.*, 
        COUNT(er.id) as registration_count,
        CASE 
          WHEN e.max_participants IS NULL THEN NULL
          ELSE e.max_participants - COUNT(er.id)
        END as available_spots
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id AND er.registration_status = 'registered'
      WHERE e.id = $1
      GROUP BY e.id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
  
  static async getRegistrations(eventId) {
    const query = `
      SELECT er.*, u.first_name, u.last_name, u.email
      FROM event_registrations er
      JOIN users u ON er.user_id = u.id
      WHERE er.event_id = $1
      ORDER BY er.registered_at DESC
    `;
    
    const result = await pool.query(query, [eventId]);
    return result.rows;
  }
}

class EventRegistration {
  static async create({ user_id, event_id }) {
    const result = await pool.query(
      `INSERT INTO event_registrations (user_id, event_id, registration_status) 
       VALUES ($1, $2, 'registered') 
       RETURNING *`,
      [user_id, event_id]
    );
    
    return result.rows[0];
  }
  
  static async findOne({ user_id, event_id }) {
    const result = await pool.query(
      'SELECT * FROM event_registrations WHERE user_id = $1 AND event_id = $2',
      [user_id, event_id]
    );
    
    return result.rows[0];
  }
  
  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE event_registrations SET registration_status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    return result.rows[0];
  }
  
  static async findByUserId(userId) {
    const query = `
      SELECT er.*, e.title, e.description, e.category, e.event_date, e.points_reward
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE er.user_id = $1
      ORDER BY er.registered_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

module.exports = { Event, EventRegistration };
