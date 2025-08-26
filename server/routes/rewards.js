const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getAllRewards,
  getRewardById,
  createReward,
  updateReward,
  deleteReward,
  toggleRewardAvailability,
  getPopularRewards,
  getRewardCategories
} = require('../controllers/rewardsController');

// Public routes (available rewards for students)
router.get('/', getAllRewards);
router.get('/categories', getRewardCategories);
router.get('/popular', getPopularRewards);
router.get('/:id', getRewardById);

// Admin-only routes
router.post('/', authenticateToken, requireRole(['admin']), createReward);
router.put('/:id', authenticateToken, requireRole(['admin']), updateReward);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteReward);
router.patch('/:id/toggle', authenticateToken, requireRole(['admin']), toggleRewardAvailability);

module.exports = router;
