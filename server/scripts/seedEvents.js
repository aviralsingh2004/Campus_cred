const pool = require('../config/database');

const seedEvents = async () => {
  try {
    // Clear existing events
    await pool.query('DELETE FROM event_registrations');
    await pool.query('DELETE FROM events');
    await pool.query('ALTER SEQUENCE events_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE event_registrations_id_seq RESTART WITH 1');

    // Insert sample events
    const eventInsertQuery = `
      INSERT INTO events (
        title, description, excerpt, category, author_name, author_avatar, 
        author_role, author_year, read_time, points_reward, max_participants, 
        registration_deadline, event_date, is_featured, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;

    const events = [
      [
        'How I Earned 500 Points in My First Semester',
        'A comprehensive workshop on maximizing your campus points through academic excellence, community service, and strategic participation in campus events. Join Sarah as she shares her proven strategies and tips.',
        'A comprehensive guide to maximizing your campus points through academic excellence, community service, and strategic participation in campus events.',
        'academic',
        'Sarah Johnson',
        'SJ',
        'Computer Science',
        'Sophomore',
        '5 min read',
        25,
        50,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        true,
        true
      ],
      [
        'The Ultimate Guide to Campus Events That Give Points',
        'Discover which campus events offer the most points and how to make the most of your time while having fun and building connections. This interactive session will help you strategize your event participation.',
        'Discover which campus events offer the most points and how to make the most of your time while having fun and building connections.',
        'events',
        'Michael Chen',
        'MC',
        'Business Administration',
        'Junior',
        '7 min read',
        30,
        40,
        new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 days from now
        false,
        true
      ],
      [
        'Balancing Academics and Points: My Experience',
        'Join this workshop to learn how to maintain excellent grades while earning maximum points through strategic time management and smart choices. Emily will share her personal system and answer your questions.',
        'How I maintained a 4.0 GPA while earning 300+ points through strategic time management and smart choices.',
        'academic',
        'Emily Rodriguez',
        'ER',
        'Psychology',
        'Senior',
        '6 min read',
        35,
        30,
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        true,
        true
      ],
      [
        'Community Service Projects That Actually Make a Difference',
        'Beyond the points, discover the most impactful community service opportunities that will change your perspective on giving back. This session includes hands-on planning for upcoming service projects.',
        'Beyond the points, here are the most impactful community service opportunities that will change your perspective on giving back.',
        'community',
        'David Kim',
        'DK',
        'Social Work',
        'Junior',
        '8 min read',
        40,
        25,
        new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        new Date(Date.now() + 19 * 24 * 60 * 60 * 1000), // 19 days from now
        false,
        true
      ],
      [
        'Leadership Workshop: Building Your Campus Influence',
        'Learn essential leadership skills while earning points through campus involvement. This interactive workshop covers communication, team building, and project management.',
        'Develop your leadership skills while maximizing your campus point earnings through strategic involvement in student organizations.',
        'leadership',
        'Jessica Park',
        'JP',
        'Political Science',
        'Senior',
        '4 min read',
        45,
        20,
        new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        new Date(Date.now() + 13 * 24 * 60 * 60 * 1000), // 13 days from now
        true,
        true
      ]
    ];

    for (const event of events) {
      await pool.query(eventInsertQuery, event);
    }

    console.log('✅ Sample events seeded successfully');

  } catch (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  }
};

module.exports = { seedEvents };
