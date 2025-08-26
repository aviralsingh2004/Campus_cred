const pool = require('../config/database');

const createEventTables = async () => {
  try {
    // Create events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        excerpt TEXT,
        category VARCHAR(100) NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        author_avatar VARCHAR(10) NOT NULL,
        author_role VARCHAR(255) NOT NULL,
        author_year VARCHAR(50) NOT NULL,
        read_time VARCHAR(50) NOT NULL,
        points_reward INTEGER DEFAULT 0,
        max_participants INTEGER,
        registration_deadline TIMESTAMP,
        event_date TIMESTAMP,
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create event_registrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        event_id INTEGER NOT NULL REFERENCES events(id),
        registration_status VARCHAR(20) DEFAULT 'registered',
        points_awarded INTEGER DEFAULT 0,
        attended_at TIMESTAMP,
        registered_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, event_id)
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON event_registrations(user_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON event_registrations(event_id);
    `);

    console.log('✅ Event tables created successfully');

  } catch (error) {
    console.error('❌ Error creating event tables:', error);
    throw error;
  }
};

module.exports = { createEventTables };
