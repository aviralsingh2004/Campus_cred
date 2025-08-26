const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const pool = require('../config/database');

const addPoints = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const userId = parseInt(req.params.id);
    const { amount, reason } = req.body;
    const adminId = req.user.id;

    await client.query('BEGIN');

    // Get student user
    const user = await User.findById(userId);
    if (!user) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'student') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Can only add points to student accounts' });
    }

    // Get admin user to check balance
    const admin = await User.findById(adminId);
    if (!admin) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Check if admin has sufficient balance
    if (admin.points_balance < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Insufficient admin balance',
        adminBalance: admin.points_balance,
        requiredAmount: amount
      });
    }

    // Update student's points balance (credit)
    const newStudentBalance = user.points_balance + amount;
    await User.updatePointsBalance(userId, newStudentBalance);

    // Update admin's points balance (debit)
    const newAdminBalance = admin.points_balance - amount;
    await User.updatePointsBalance(adminId, newAdminBalance);

    // Create transaction record for student (credit)
    const studentTransaction = await Transaction.create({
      user_id: userId,
      transaction_type: 'credit',
      amount: amount,
      reason: reason,
      admin_id: adminId
    });

    // Create transaction record for admin (debit)
    const adminTransaction = await Transaction.create({
      user_id: adminId,
      transaction_type: 'debit',
      amount: amount,
      reason: `Transfer to ${user.first_name} ${user.last_name} (${user.student_id}): ${reason}`,
      admin_id: adminId
    });

    await client.query('COMMIT');

    res.json({
      message: 'Points transferred successfully',
      studentTransaction: {
        id: studentTransaction.id,
        amount: studentTransaction.amount,
        reason: studentTransaction.reason,
        created_at: studentTransaction.created_at
      },
      adminTransaction: {
        id: adminTransaction.id,
        amount: adminTransaction.amount,
        reason: adminTransaction.reason,
        created_at: adminTransaction.created_at
      },
      student: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        student_id: user.student_id,
        previous_balance: user.points_balance,
        new_balance: newStudentBalance
      },
      admin: {
        id: admin.id,
        previous_balance: admin.points_balance,
        new_balance: newAdminBalance
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const deductPoints = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const userId = parseInt(req.params.id);
    const { amount, reason } = req.body;
    const adminId = req.user.id;

    await client.query('BEGIN');

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'student') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Can only deduct points from student accounts' });
    }

    if (user.points_balance < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'User does not have enough points to deduct' });
    }

    // Update points balance
    const newBalance = user.points_balance - amount;
    await User.updatePointsBalance(userId, newBalance);

    // Create transaction record
    const transaction = await Transaction.create({
      user_id: userId,
      transaction_type: 'debit',
      amount: amount,
      reason: reason,
      admin_id: adminId
    });

    await client.query('COMMIT');

    res.json({
      message: 'Points deducted successfully',
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        reason: transaction.reason,
        created_at: transaction.created_at
      },
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        student_id: user.student_id,
        previous_balance: user.points_balance,
        new_balance: newBalance
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';

    let query = `
      SELECT id, email, first_name, last_name, student_id, points_balance, created_at 
      FROM users 
      WHERE role = 'student'
    `;
    const params = [];

    if (search) {
      query += ` AND (
        first_name ILIKE $1 OR 
        last_name ILIKE $1 OR 
        email ILIKE $1 OR 
        student_id ILIKE $1
      )`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await pool.query(query, params);

    res.json({
      students: result.rows,
      pagination: {
        page,
        limit,
        hasMore: result.rows.length === limit
      }
    });
  } catch (error) {
    next(error);
  }
};

const getStudentDetails = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'student') {
      return res.status(400).json({ error: 'User is not a student' });
    }

    // Get recent transactions
    const transactions = await Transaction.findByUserId(userId, 10);
    
    // Get recent redemptions
    const redemptions = await Redemption.findByUserId(userId, 10);

    res.json({
      user,
      transactions,
      redemptions
    });
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const transactions = await Transaction.getAllTransactions(limit, offset);

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

const getAllRedemptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const redemptions = await Redemption.getAllRedemptions(limit, offset);

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

const updateRedemptionStatus = async (req, res, next) => {
  try {
    const redemptionId = parseInt(req.params.redemptionId);
    const { status } = req.body;

    if (!['pending', 'approved', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const redemption = await Redemption.updateStatus(redemptionId, status);
    if (!redemption) {
      return res.status(404).json({ error: 'Redemption not found' });
    }

    res.json({
      message: 'Redemption status updated successfully',
      redemption
    });
  } catch (error) {
    next(error);
  }
};

const getHomeStats = async (req, res, next) => {
  try {
    // Get various statistics for admin Home
    const [transactionStats, redemptionStats] = await Promise.all([
      Transaction.getTransactionStats(),
      Redemption.getRedemptionStats()
    ]);

    // Get total students count
    const studentsResult = await pool.query(
      "SELECT COUNT(*) as total_students FROM users WHERE role = 'student'"
    );

    // Get pending redemptions count
    const pendingRedemptions = await Redemption.getPendingRedemptions();

    res.json({
      totalStudents: parseInt(studentsResult.rows[0].total_students),
      pendingRedemptions: pendingRedemptions.length,
      transactionStats,
      redemptionStats,
      pendingRedemptionsList: pendingRedemptions.slice(0, 5) // Recent 5 for quick view
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPoints,
  deductPoints,
  getAllStudents,
  getStudentDetails,
  getAllTransactions,
  getAllRedemptions,
  updateRedemptionStatus,
  getHomeStats
};
