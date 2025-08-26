const pool = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🗄️  Creating database tables...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
        student_id VARCHAR(20) UNIQUE,
        points_balance INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Rewards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        points_cost INTEGER NOT NULL,
        category VARCHAR(100),
        is_available BOOLEAN DEFAULT true,
        stock_quantity INTEGER DEFAULT -1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'redemption')),
        amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        reward_id INTEGER REFERENCES rewards(id) ON DELETE SET NULL,
        admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Redemptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS redemptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reward_id INTEGER REFERENCES rewards(id) ON DELETE CASCADE,
        points_spent INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id)');

    console.log('✅ Database tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

const initDatabase = async () => {
  try {
    await createTables();
    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('💥 Database initialization failed:', error);
    process.exit(1);
  }
};

module.exports = { createTables, initDatabase };

// Run if this file is executed directly
if (require.main === module) {
  initDatabase();
}
