const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        error.message = 'Resource already exists';
        error.status = 409;
        break;
      case '23503': // Foreign key violation
        error.message = 'Referenced resource not found';
        error.status = 400;
        break;
      case '23502': // Not null violation
        error.message = 'Required field is missing';
        error.status = 400;
        break;
      default:
        error.message = 'Database error';
        error.status = 500;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  } else if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = err.message;
    error.status = 400;
  }

  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};

module.exports = {
  errorHandler,
  notFound
};
