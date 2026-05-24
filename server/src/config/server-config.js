const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID,
  NOTION_CLIENT_SECRET: process.env.NOTION_CLIENT_SECRET,
  NOTION_REDIRECT_URI: process.env.NOTION_REDIRECT_URI || 'http://localhost:5000/api/v1/integrations/notion/callback',
};
