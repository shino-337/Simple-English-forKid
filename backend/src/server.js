const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config/config');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const wordRoutes = require('./routes/words');
const challengeRoutes = require('./routes/challenges');
const seedDatabase = require('./scripts/seedDatabase');
const path = require('path');

// Initialize Express app
const app = express();

// MongoDB connection options with improved settings
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 120000,
  connectTimeoutMS: 60000,
  family: 4,
  maxPoolSize: 10,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  w: 'majority'
};

// Global connection flag to prevent multiple reconnection attempts
let isConnecting = false;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 5000;

// Connect to MongoDB with improved reconnection logic
const connectWithRetry = () => {
  if (isConnecting) return;
  
  isConnecting = true;
  connectionAttempts++;
  
  console.log(`MongoDB connection attempt ${connectionAttempts}...`);
  
  mongoose.connect(config.mongoUri, mongoOptions)
    .then(() => {
      console.log('MongoDB Connected Successfully');
      isConnecting = false;
      connectionAttempts = 0;
      
      // Seed the database with initial data
      seedDatabase().catch(err => console.error('Error seeding database:', err));
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
      isConnecting = false;
      
      if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
        console.log(`Retrying connection in ${RECONNECT_INTERVAL/1000} seconds...`);
        setTimeout(connectWithRetry, RECONNECT_INTERVAL);
      } else {
        console.error(`Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts. Please check your MongoDB configuration.`);
      }
    });
};

// Initial connection
connectWithRetry();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  if (!isConnecting && mongoose.connection.readyState !== 1) {
    connectWithRetry();
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  if (!isConnecting && mongoose.connection.readyState !== 1) {
    console.log('Attempting to reconnect...');
    setTimeout(connectWithRetry, RECONNECT_INTERVAL);
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
  connectionAttempts = 0;
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/uploads/images', express.static(path.join(__dirname, '../public/uploads/images')));
app.use('/uploads/audio', express.static(path.join(__dirname, '../public/uploads/audio')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to English Learning API' });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/progress', require('./routes/progress'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Don't exit in development - just log the error
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});
