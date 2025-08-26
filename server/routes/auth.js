const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { register, login, getProfile, refreshToken } = require('../controllers/authController');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/refresh', authenticateToken, refreshToken);

module.exports = router;
