const Reward = require('../models/Reward');

const getAllRewards = async (req, res, next) => {
  try {
    const availableOnly = req.query.available === 'true';
    const category = req.query.category;

    let rewards;
    if (category) {
      rewards = await Reward.findByCategory(category);
    } else {
      rewards = await Reward.findAll(availableOnly);
    }

    res.json({
      rewards,
      categories: await Reward.getCategories()
    });
  } catch (error) {
    next(error);
  }
};

const getRewardById = async (req, res, next) => {
  try {
    const rewardId = parseInt(req.params.id);
    
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({ reward });
  } catch (error) {
    next(error);
  }
};

const createReward = async (req, res, next) => {
  try {
    const { name, description, points_cost, category, stock_quantity } = req.body;

    if (!name || !points_cost || points_cost <= 0) {
      return res.status(400).json({ error: 'Name and valid points cost are required' });
    }

    const reward = await Reward.create({
      name: name.trim(),
      description: description?.trim() || null,
      points_cost: parseInt(points_cost),
      category: category?.trim() || null,
      stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : -1
    });

    res.status(201).json({
      message: 'Reward created successfully',
      reward
    });
  } catch (error) {
    next(error);
  }
};

const updateReward = async (req, res, next) => {
  try {
    const rewardId = parseInt(req.params.id);
    const { name, description, points_cost, category, stock_quantity, is_available } = req.body;

    // Check if reward exists
    const existingReward = await Reward.findById(rewardId);
    if (!existingReward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name.trim());
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description?.trim() || null);
    }
    if (points_cost !== undefined) {
      if (points_cost <= 0) {
        return res.status(400).json({ error: 'Points cost must be positive' });
      }
      updates.push(`points_cost = $${paramCount++}`);
      values.push(parseInt(points_cost));
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category?.trim() || null);
    }
    if (stock_quantity !== undefined) {
      updates.push(`stock_quantity = $${paramCount++}`);
      values.push(parseInt(stock_quantity));
    }
    if (is_available !== undefined) {
      updates.push(`is_available = $${paramCount++}`);
      values.push(Boolean(is_available));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(rewardId);

    const query = `
      UPDATE rewards 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const pool = require('../config/database');
    const result = await pool.query(query, values);

    res.json({
      message: 'Reward updated successfully',
      reward: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const deleteReward = async (req, res, next) => {
  try {
    const rewardId = parseInt(req.params.id);

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    // Instead of deleting, we'll mark as unavailable to preserve transaction history
    const pool = require('../config/database');
    await pool.query(
      'UPDATE rewards SET is_available = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [rewardId]
    );

    res.json({
      message: 'Reward marked as unavailable successfully'
    });
  } catch (error) {
    next(error);
  }
};

const toggleRewardAvailability = async (req, res, next) => {
  try {
    const rewardId = parseInt(req.params.id);

    const reward = await Reward.toggleAvailability(rewardId);
    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({
      message: `Reward ${reward.is_available ? 'enabled' : 'disabled'} successfully`,
      reward
    });
  } catch (error) {
    next(error);
  }
};

const getPopularRewards = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const rewards = await Reward.getPopularRewards(limit);

    res.json({
      rewards
    });
  } catch (error) {
    next(error);
  }
};

const getRewardCategories = async (req, res, next) => {
  try {
    const categories = await Reward.getCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRewards,
  getRewardById,
  createReward,
  updateReward,
  deleteReward,
  toggleRewardAvailability,
  getPopularRewards,
  getRewardCategories
};
