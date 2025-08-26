const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('student_id')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters'),
  body('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage('Role must be either student or admin'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validatePointsUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive integer'),
  body('reason')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Reason must be between 3 and 255 characters'),
  handleValidationErrors
];

// Accept either { points, reason } or { amount, reason } and normalize to { amount, reason }
const normalizePointsAmount = (req, _res, next) => {
  if (req.body && req.body.points != null && req.body.amount == null) {
    const parsed = parseInt(req.body.points);
    if (!Number.isNaN(parsed)) {
      req.body.amount = parsed;
    }
  }
  next();
};

const validateRedemption = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  body('reward_id')
    .isInt({ min: 1 })
    .withMessage('Valid reward ID is required'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validatePointsUpdate,
  validateRedemption,
  normalizePointsAmount
};
