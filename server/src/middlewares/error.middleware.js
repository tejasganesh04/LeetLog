const logger = require('../config/logger-config');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (!err.isOperational) logger.error(`Unhandled error: ${err.stack}`);

  res.status(statusCode).json({ success: false, message });
};

module.exports = { errorHandler };
