const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateRedemption } = require('../middleware/validation');
const {
  getPoints,
  getTransactionHistory,
  redeemPoints,
  getRedemptions,
  getHomeData
} = require('../controllers/studentController');

// All routes require authentication
router.use(authenticateToken);

// Student Home
router.get('/Home', getHomeData);

// Points and transactions
router.get('/:id/points', getPoints);
router.get('/:id/transactions', getTransactionHistory);

// Redemptions
router.post('/:id/redeem', validateRedemption, redeemPoints);
router.get('/:id/redemptions', getRedemptions);

module.exports = router;
