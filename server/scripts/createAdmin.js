const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const createAdminUser = async () => {
  try {
    console.log('Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@campuscred.edu']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists!');
      console.log('Login with: admin@campuscred.edu / admin123');
      return;
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, points_balance) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['admin@campuscred.edu', adminPassword, 'Admin', 'User', 'admin', 0]
    );

    console.log('✅ Admin user created successfully!');
    console.log('Login with: admin@campuscred.edu / admin123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
};

createAdminUser();
