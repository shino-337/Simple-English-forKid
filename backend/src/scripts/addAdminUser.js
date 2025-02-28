const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/config');

// Admin user details - you can modify these as needed
const adminUser = {
  name: 'New Admin',
  email: 'newadmin@example.com',
  password: 'admin123',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=newadmin@example.com'
};

async function addAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: adminUser.email });
    if (existingUser) {
      console.log(`User with email ${adminUser.email} already exists`);
      await mongoose.disconnect();
      return;
    }

    // Create the admin user
    await User.create(adminUser);
    console.log(`Admin user created successfully: ${adminUser.email}`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error adding admin user:', error);
    await mongoose.disconnect();
  }
}

// Run the function
addAdminUser(); 