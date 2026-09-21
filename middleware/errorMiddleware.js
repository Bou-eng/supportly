// Catch-all for undefined routes
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle invalid Mongoose ObjectId (e.g., /api/tickets/invalid-id)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Handle Mongoose duplicate key error (e.g., duplicate email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field} field`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};