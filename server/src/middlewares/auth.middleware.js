const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/server-config');
const { UnauthorizedError } = require('../utils/errors');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next(new UnauthorizedError('No token provided'));

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

module.exports = { authenticate };
