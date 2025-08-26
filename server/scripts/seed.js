const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const seedDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (optional - be careful with this in production)
    await client.query('TRUNCATE users, transactions, rewards, redemptions RESTART IDENTITY CASCADE');
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminResult = await client.query(
      `INSERT INTO users (email, password, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['admin@campuscred.edu', adminPassword, 'Admin', 'User', 'admin']
    );
    const adminId = adminResult.rows[0].id;
    console.log('👑 Created admin user: admin@campuscred.edu / admin123');

    // Create sample student users
    const students = [
      {
        email: 'john.doe@student.edu',
        password: 'student123',
        first_name: 'John',
        last_name: 'Doe',
        student_id: 'STU001',
        points: 1500
      },
      {
        email: 'jane.smith@student.edu',
        password: 'student123',
        first_name: 'Jane',
        last_name: 'Smith',
        student_id: 'STU002',
        points: 2300
      },
      {
        email: 'mike.wilson@student.edu',
        password: 'student123',
        first_name: 'Mike',
        last_name: 'Wilson',
        student_id: 'STU003',
        points: 800
      },
      {
        email: 'sarah.johnson@student.edu',
        password: 'student123',
        first_name: 'Sarah',
        last_name: 'Johnson',
        student_id: 'STU004',
        points: 3200
      },
      {
        email: 'alex.brown@student.edu',
        password: 'student123',
        first_name: 'Alex',
        last_name: 'Brown',
        student_id: 'STU005',
        points: 950
      }
    ];

    const studentIds = [];
    for (const student of students) {
      const hashedPassword = await bcrypt.hash(student.password, 12);
      const result = await client.query(
        `INSERT INTO users (email, password, first_name, last_name, role, student_id, points_balance) 
         VALUES ($1, $2, $3, $4, 'student', $5, $6) RETURNING id`,
        [student.email, hashedPassword, student.first_name, student.last_name, student.student_id, student.points]
      );
      studentIds.push(result.rows[0].id);
    }
    console.log(`👥 Created ${students.length} student users (password: student123)`);

    // Create sample rewards
    const rewards = [
      {
        name: 'Coffee Shop Gift Card ($10)',
        description: 'Enjoy a free coffee and pastry at the campus coffee shop',
        points_cost: 500,
        category: 'Food & Beverage',
        stock: 20
      },
      {
        name: 'Library Late Fee Waiver',
        description: 'Waive up to $25 in library late fees',
        points_cost: 300,
        category: 'Academic',
        stock: -1 // unlimited
      },
      {
        name: 'Campus Bookstore 15% Discount',
        description: '15% discount on your next bookstore purchase',
        points_cost: 750,
        category: 'Academic',
        stock: 50
      },
      {
        name: 'Free Campus Gym Day Pass',
        description: 'One-day access to the campus fitness center',
        points_cost: 200,
        category: 'Recreation',
        stock: 100
      },
      {
        name: 'Priority Course Registration',
        description: 'Get early access to course registration for next semester',
        points_cost: 2000,
        category: 'Academic',
        stock: 10
      },
      {
        name: 'Campus Store T-Shirt',
        description: 'Official university branded t-shirt',
        points_cost: 400,
        category: 'Merchandise',
        stock: 25
      },
      {
        name: 'Food Court $15 Credit',
        description: '$15 credit to spend at any food court vendor',
        points_cost: 800,
        category: 'Food & Beverage',
        stock: 30
      },
      {
        name: 'Parking Pass (1 Week)',
        description: 'One week of free parking in premium campus lots',
        points_cost: 600,
        category: 'Services',
        stock: 15
      },
      {
        name: 'Movie Theater Tickets (2)',
        description: 'Two tickets to the local movie theater',
        points_cost: 1200,
        category: 'Entertainment',
        stock: 40
      },
      {
        name: 'Study Room Booking Priority',
        description: 'Priority booking for study rooms for one month',
        points_cost: 350,
        category: 'Academic',
        stock: 20
      }
    ];

    for (const reward of rewards) {
      await client.query(
        `INSERT INTO rewards (name, description, points_cost, category, stock_quantity) 
         VALUES ($1, $2, $3, $4, $5)`,
        [reward.name, reward.description, reward.points_cost, reward.category, reward.stock]
      );
    }
    console.log(`🏆 Created ${rewards.length} sample rewards`);

    // Create sample transactions for students
    const transactionReasons = [
      'Attended Career Fair',
      'Completed Student Survey',
      'Volunteered at Campus Event',
      'Perfect Attendance - Week 1',
      'Participated in Study Group',
      'Completed Online Course Module',
      'Attended Workshop: Resume Writing',
      'Participated in Campus Cleanup',
      'Submitted Assignment Early',
      'Helped New Student Orientation',
      'Academic Excellence Bonus',
      'Community Service Hours'
    ];

    for (let i = 0; i < studentIds.length; i++) {
      const studentId = studentIds[i];
      
      // Create 3-7 random transactions per student
      const transactionCount = Math.floor(Math.random() * 5) + 3;
      
      for (let j = 0; j < transactionCount; j++) {
        const amount = Math.floor(Math.random() * 500) + 50; // 50-550 points
        const reason = transactionReasons[Math.floor(Math.random() * transactionReasons.length)];
        
        // Create transaction 1-30 days ago
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        
        await client.query(
          `INSERT INTO transactions (user_id, transaction_type, amount, reason, admin_id, created_at) 
           VALUES ($1, 'credit', $2, $3, $4, NOW() - INTERVAL '${daysAgo} days')`,
          [studentId, amount, reason, adminId]
        );
      }
    }
    console.log('💳 Created sample transaction history');

    // Create a few sample redemptions
    const sampleRedemptions = [
      { studentIdx: 0, rewardIdx: 0 }, // John redeems coffee card
      { studentIdx: 1, rewardIdx: 3 }, // Jane redeems gym pass
      { studentIdx: 3, rewardIdx: 6 }, // Sarah redeems food court credit
      { studentIdx: 1, rewardIdx: 1 }  // Jane redeems library waiver
    ];

    for (const redemption of sampleRedemptions) {
      const studentId = studentIds[redemption.studentIdx];
      const reward = rewards[redemption.rewardIdx];
      
      await client.query(
        `INSERT INTO redemptions (user_id, reward_id, points_spent, status) 
         VALUES ($1, $2, $3, 'completed')`,
        [studentId, redemption.rewardIdx + 1, reward.points_cost] // rewardIdx + 1 because DB IDs start at 1
      );

      // Also create redemption transaction
      await client.query(
        `INSERT INTO transactions (user_id, transaction_type, amount, reason, reward_id, created_at) 
         VALUES ($1, 'redemption', $2, $3, $4, NOW() - INTERVAL '${Math.floor(Math.random() * 10)} days')`,
        [studentId, reward.points_cost, `Redeemed: ${reward.name}`, redemption.rewardIdx + 1]
      );
    }
    console.log('🎁 Created sample redemption history');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Sample Login Credentials:');
    console.log('Admin: admin@campuscred.edu / admin123');
    console.log('Students:');
    students.forEach(student => {
      console.log(`  ${student.email} / student123 (${student.points} points)`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
};

const runSeed = async () => {
  try {
    // First initialize the database tables
    const { initDatabase } = require('./initDb');
    await initDatabase();
    
    // Then seed with sample data
    await seedDatabase();
    
    console.log('\n✅ Complete setup finished!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedDatabase };
