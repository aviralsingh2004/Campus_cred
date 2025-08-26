const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const pool = require('../config/database');

const getPoints = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user is accessing their own data or is an admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(400).json({ error: 'Only students have point balances' });
    }

    // Get transaction history
    const transactions = await Transaction.findByUserId(userId, 20);
    
    // Get points history for chart data
    const pointsHistory = await Transaction.getPointsHistory(userId);

    res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        student_id: user.student_id,
        points_balance: user.points_balance
      },
      transactions,
      pointsHistory
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionHistory = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const transactions = await Transaction.findByUserId(userId, limit, offset);

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        hasMore: transactions.length === limit
      }
    });
  } catch (error) {
    next(error);
  }
};

const redeemPoints = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const userId = parseInt(req.params.id);
    const { reward_id } = req.body;

    // Check if user is accessing their own data
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await client.query('BEGIN');

    // Get user and reward info
    const user = await User.findById(userId);
    const reward = await Reward.findById(reward_id);

    if (!user) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    if (!reward) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reward not found' });
    }

    if (!reward.is_available) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Reward is not available' });
    }

    if (reward.stock_quantity === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Reward is out of stock' });
    }

    if (user.points_balance < reward.points_cost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // Update user's points balance
    const newBalance = user.points_balance - reward.points_cost;
    await User.updatePointsBalance(userId, newBalance);

    // Decrement reward stock (if applicable)
    if (reward.stock_quantity > 0) {
      await Reward.decrementStock(reward_id);
    }

    // Create transaction record
    await Transaction.create({
      user_id: userId,
      transaction_type: 'redemption',
      amount: reward.points_cost,
      reason: `Redeemed reward: ${reward.name}`,
      reward_id: reward_id
    });

    // Create redemption record (start as pending, then mark completed)
    let redemption = await Redemption.create({
      user_id: userId,
      reward_id: reward_id,
      points_spent: reward.points_cost
    });

    // Mark redemption as completed now that all operations succeeded
    redemption = await Redemption.updateStatus(redemption.id, 'completed');

    await client.query('COMMIT');

    res.json({
      message: 'Points redeemed successfully',
      redemption: {
        id: redemption.id,
        reward_name: reward.name,
        points_spent: reward.points_cost,
        status: redemption.status,
        created_at: redemption.created_at
      },
      new_balance: newBalance
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const getRedemptions = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const redemptions = await Redemption.findByUserId(userId, limit, offset);

    res.json({
      redemptions,
      pagination: {
        page,
        limit,
        hasMore: redemptions.length === limit
      }
    });
  } catch (error) {
    next(error);
  }
};

const getHomeData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can access Home' });
    }

    // Get user points and recent transactions
    const user = await User.findById(userId);
    const recentTransactions = await Transaction.findByUserId(userId, 5);
    const recentRedemptions = await Redemption.findByUserId(userId, 5);
    
    // Get available rewards
    const availableRewards = await Reward.findAll(true);
    
    // Get popular rewards
    const popularRewards = await Reward.getPopularRewards(5);

    res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        student_id: user.student_id,
        points_balance: user.points_balance
      },
      recentTransactions,
      recentRedemptions,
      availableRewards: availableRewards.slice(0, 6), // Limit to 6 for Home
      popularRewards
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPoints,
  getTransactionHistory,
  redeemPoints,
  getRedemptions,
  getHomeData
};
