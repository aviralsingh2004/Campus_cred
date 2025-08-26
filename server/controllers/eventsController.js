const { Event, EventRegistration } = require('../models/Event');
const pool = require('../config/database');

// Get all events/posts
const getAllEvents = async (req, res) => {
  try {
    const { category, featured, active = 'true' } = req.query;
    
    const whereConditions = { is_active: active === 'true' };
    
    if (category && category !== 'all') {
      whereConditions.category = category;
    }
    
    if (featured !== undefined) {
      whereConditions.is_featured = featured === 'true';
    }

    const events = await Event.findAll(whereConditions);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get registrations for this event
    const registrations = await Event.getRegistrations(id);
    event.registrations = registrations;

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
};

// Register user for an event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is still active
    if (!event.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Event is no longer active'
      });
    }

    // Check registration deadline
    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check if already registered
    const existingRegistration = await EventRegistration.findOne({
      user_id: userId,
      event_id: eventId
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check if event is full
    if (event.max_participants && event.registration_count >= event.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Create registration
    const registration = await EventRegistration.create({
      user_id: userId,
      event_id: eventId
    });

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event!',
      data: {
        registration_id: registration.id,
        event_title: event.title,
        points_reward: event.points_reward
      }
    });

  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event'
    });
  }
};

// Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const registration = await EventRegistration.findOne({
      user_id: userId,
      event_id: eventId
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    await EventRegistration.updateStatus(registration.id, 'cancelled');

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration'
    });
  }
};

// Get user's registrations
const getUserRegistrations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const registrations = await EventRegistration.findByUserId(userId);

    res.json({
      success: true,
      data: registrations
    });

  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
};

// ==================== ADMIN FUNCTIONS ====================

// Get all events for admin management
const getEventsForAdmin = async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    
    let whereConditions = {};
    if (status === 'active') {
      whereConditions.is_active = true;
    } else if (status === 'completed') {
      whereConditions.is_active = false;
    }

    const events = await Event.findAll(whereConditions);
    
    // Get registrations for each event
    const eventsWithRegistrations = await Promise.all(
      events.map(async (event) => {
        const registrations = await Event.getRegistrations(event.id);
        return {
          ...event,
          registrations,
          total_registrations: registrations.length,
          pending_registrations: registrations.filter(r => r.registration_status === 'registered').length,
          completed_registrations: registrations.filter(r => r.registration_status === 'attended').length
        };
      })
    );

    res.json({
      success: true,
      data: eventsWithRegistrations
    });
  } catch (error) {
    console.error('Error fetching events for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

// Mark event as completed and award points to attendees
const completeEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { attendeeIds = [] } = req.body; // Array of user IDs who attended

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get event details
      const eventResult = await client.query('SELECT * FROM events WHERE id = $1', [eventId]);
      const event = eventResult.rows[0];

      if (!event) {
        throw new Error('Event not found');
      }

      if (!event.is_active) {
        throw new Error('Event is already completed');
      }

      // Get all registrations for this event
      const registrationsResult = await client.query(
        'SELECT * FROM event_registrations WHERE event_id = $1 AND registration_status = $2',
        [eventId, 'registered']
      );

      let pointsAwarded = 0;
      let usersAwarded = [];

      // Process each registration
      for (const registration of registrationsResult.rows) {
        if (attendeeIds.length === 0 || attendeeIds.includes(registration.user_id)) {
          // Mark as attended
          await client.query(
            'UPDATE event_registrations SET registration_status = $1, attended_at = NOW(), points_awarded = $2 WHERE id = $3',
            ['attended', event.points_reward, registration.id]
          );

          // Award points to user
          await client.query(
            'UPDATE users SET points_balance = points_balance + $1 WHERE id = $2',
            [event.points_reward, registration.user_id]
          );

          // Create transaction record
          await client.query(
            `INSERT INTO transactions (user_id, transaction_type, amount, description, reference_type, reference_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              registration.user_id,
              'credit',
              event.points_reward,
              `Points awarded for completing event: ${event.title}`,
              'event',
              eventId
            ]
          );

          pointsAwarded += event.points_reward;
          usersAwarded.push(registration.user_id);
        }
      }

      // Mark event as completed if all attendees are processed
      if (attendeeIds.length === 0) {
        await client.query('UPDATE events SET is_active = false WHERE id = $1', [eventId]);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Event completed successfully. ${usersAwarded.length} users awarded ${event.points_reward} points each.`,
        data: {
          event_id: eventId,
          users_awarded: usersAwarded.length,
          total_points_awarded: pointsAwarded,
          points_per_user: event.points_reward
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error completing event:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete event'
    });
  }
};

// Mark individual registrations as attended
const markAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userIds = [] } = req.body; // Array of user IDs to mark as attended

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get event details
      const eventResult = await client.query('SELECT * FROM events WHERE id = $1', [eventId]);
      const event = eventResult.rows[0];

      if (!event) {
        throw new Error('Event not found');
      }

      let pointsAwarded = 0;
      let usersAwarded = [];

      for (const userId of userIds) {
        // Check if user is registered
        const regResult = await client.query(
          'SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2 AND registration_status = $3',
          [eventId, userId, 'registered']
        );

        if (regResult.rows.length > 0) {
          const registration = regResult.rows[0];

          // Mark as attended
          await client.query(
            'UPDATE event_registrations SET registration_status = $1, attended_at = NOW(), points_awarded = $2 WHERE id = $3',
            ['attended', event.points_reward, registration.id]
          );

          // Award points to user
          await client.query(
            'UPDATE users SET points_balance = points_balance + $1 WHERE id = $2',
            [event.points_reward, userId]
          );

          // Create transaction record
          await client.query(
            `INSERT INTO transactions (user_id, transaction_type, amount, description, reference_type, reference_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              userId,
              'credit',
              event.points_reward,
              `Points awarded for attending event: ${event.title}`,
              'event',
              eventId
            ]
          );

          pointsAwarded += event.points_reward;
          usersAwarded.push(userId);
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Attendance marked for ${usersAwarded.length} users. ${event.points_reward} points awarded each.`,
        data: {
          event_id: eventId,
          users_awarded: usersAwarded.length,
          total_points_awarded: pointsAwarded,
          points_per_user: event.points_reward
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark attendance'
    });
  }
};

// Get event attendance report
const getEventReport = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Get event details with full registration info
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get detailed registrations with user info
    const registrations = await pool.query(`
      SELECT 
        er.*,
        u.first_name,
        u.last_name,
        u.email,
        u.student_id,
        u.points_balance
      FROM event_registrations er
      JOIN users u ON er.user_id = u.id
      WHERE er.event_id = $1
      ORDER BY er.registered_at ASC
    `, [eventId]);

    const report = {
      ...event,
      registrations: registrations.rows,
      summary: {
        total_registered: registrations.rows.length,
        attended: registrations.rows.filter(r => r.registration_status === 'attended').length,
        pending: registrations.rows.filter(r => r.registration_status === 'registered').length,
        cancelled: registrations.rows.filter(r => r.registration_status === 'cancelled').length,
        total_points_awarded: registrations.rows.reduce((sum, r) => sum + (r.points_awarded || 0), 0)
      }
    };

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error generating event report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate event report'
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  registerForEvent,
  cancelRegistration,
  getUserRegistrations,
  // Admin functions
  getEventsForAdmin,
  completeEvent,
  markAttendance,
  getEventReport
};
