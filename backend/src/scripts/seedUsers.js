require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/config');

// Array of users to seed
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin@example.com'
  },
  {
    name: 'Teacher Account',
    email: 'teacher@example.com',
    password: 'teacher123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=teacher@example.com'
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user@example.com'
  },
  {
    name: 'Student One',
    email: 'student1@example.com',
    password: 'student123',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=student1@example.com'
  },
  {
    name: 'Student Two',
    email: 'student2@example.com',
    password: 'student123',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=student2@example.com'
  }
];

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('MongoDB Connected');
    seedUsers();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed users
async function seedUsers() {
  try {
    // Delete all existing users
    await User.deleteMany({});
    console.log('Deleted all existing users');

    // Create new users
    for (const userData of users) {
      await User.create(userData);
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
} 