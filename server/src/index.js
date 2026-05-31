const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ServerConfig, Logger, connectDB } = require('./config');
const { errorHandler } = require('./middlewares');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === ServerConfig.CLIENT_URL || origin.startsWith('chrome-extension://') || origin.startsWith('ms-browser-extension://')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use('/api', routes);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(ServerConfig.PORT, () => {
    Logger.info(`LeetLog server running on port ${ServerConfig.PORT}`);
  });
};

start();
