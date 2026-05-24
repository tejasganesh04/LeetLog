const { authenticate } = require('./auth.middleware');
const { errorHandler } = require('./error.middleware');

module.exports = { authenticate, errorHandler };
