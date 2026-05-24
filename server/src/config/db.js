const mongoose = require('mongoose');
const { MONGO_URI } = require('./server-config');
const logger = require('./logger-config');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
