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

async function seedDatabase() {
  try {
    // Check if we're already connected to MongoDB
    if (mongoose.connection.readyState !== 1) {
      // Connect to MongoDB only if not already connected
      await mongoose.connect(config.mongoUri);
      console.log('Connected to MongoDB for seeding');
    } else {
      console.log('Using existing MongoDB connection for seeding');
    }

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Database already has users, skipping seed');
      // Only disconnect if this script was run directly
      if (require.main === module) {
        await mongoose.disconnect();
      }
      return;
    }

    // Create users
    for (const userData of users) {
      await User.create(userData);
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Database seeded successfully');
    // Only disconnect if this script was run directly
    if (require.main === module) {
      await mongoose.disconnect();
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    // Only disconnect if this script was run directly
    if (require.main === module) {
      await mongoose.disconnect();
    }
  }
}

// Only seed if this script is called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase; 