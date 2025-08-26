const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validatePointsUpdate, normalizePointsAmount } = require('../middleware/validation');
const {
  addPoints,
  deductPoints,
  getAllStudents,
  getStudentDetails,
  getAllTransactions,
  getAllRedemptions,
  updateRedemptionStatus,
  getHomeStats
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(authenticateToken, requireRole(['admin']));

// Home
router.get('/Home', getHomeStats);

// Student management
router.get('/students', getAllStudents);
router.get('/students/:id', getStudentDetails);

// Points management (normalize payload then validate)
router.post('/students/:id/add-points', normalizePointsAmount, validatePointsUpdate, addPoints);
router.post('/students/:id/deduct-points', normalizePointsAmount, validatePointsUpdate, deductPoints);

// Transaction management
router.get('/transactions', getAllTransactions);

// Redemption management
router.get('/redemptions', getAllRedemptions);
router.patch('/redemptions/:redemptionId/status', updateRedemptionStatus);

module.exports = router;
