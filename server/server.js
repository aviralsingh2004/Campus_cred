const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const adminRoutes = require('./routes/admin');
const rewardRoutes = require('./routes/rewards');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit for development
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development for localhost
    return process.env.NODE_ENV === 'development' && 
           (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('192.168.') || req.ip.includes('10.'));
  }
});

// Apply rate limiting to auth routes more strictly
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased for development
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting in development for localhost
    return process.env.NODE_ENV === 'development' && 
           (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('192.168.') || req.ip.includes('10.'));
  }
});

app.use('/api/', limiter);
app.use('/api/auth', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CampusCred API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rewards', rewardRoutes);

// 404 handler
app.use('/api/*', notFound);

// Error handling middleware
app.use(errorHandler);

// Database connection test
const testDbConnection = async () => {
  try {
    const pool = require('./config/database');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔧 Make sure PostgreSQL is running and check your .env file');
  }
};

// Start server
const startServer = async () => {
  try {
    await testDbConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log(`💊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🎯 Frontend URL: ${process.env.CLIENT_URL}`);
      console.log('\n📚 API Endpoints:');
      console.log('  POST /api/auth/register - Register user');
      console.log('  POST /api/auth/login - Login user');
      console.log('  GET  /api/auth/profile - Get user profile');
      console.log('  GET  /api/students/Home - Student Home');
      console.log('  GET  /api/students/:id/points - Get student points');
      console.log('  POST /api/students/:id/redeem - Redeem points');
      console.log('  GET  /api/admin/Home - Admin Home');
      console.log('  POST /api/admin/students/:id/add-points - Add points');
      console.log('  POST /api/admin/students/:id/deduct-points - Deduct points');
      console.log('  GET  /api/rewards - Get all rewards');
      console.log('  POST /api/rewards - Create reward (admin)');
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Promise Rejection:', err);
  process.exit(1);
});

startServer();

module.exports = app;
