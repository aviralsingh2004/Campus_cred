const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/eventsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected user routes
router.post('/:eventId/register', authenticateToken, registerForEvent);
router.post('/:eventId/cancel', authenticateToken, cancelRegistration);
router.get('/user/:userId/registrations', authenticateToken, getUserRegistrations);

// Admin routes
router.get('/admin/events', authenticateToken, requireAdmin, getEventsForAdmin);
router.post('/admin/:eventId/complete', authenticateToken, requireAdmin, completeEvent);
router.post('/admin/:eventId/attendance', authenticateToken, requireAdmin, markAttendance);
router.get('/admin/:eventId/report', authenticateToken, requireAdmin, getEventReport);

module.exports = router;
