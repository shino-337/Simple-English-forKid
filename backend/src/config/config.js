require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/english-learning-app',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpires: process.env.JWT_EXPIRES || '7d'
}; 