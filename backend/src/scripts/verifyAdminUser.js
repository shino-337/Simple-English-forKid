const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/config');

// Email of the admin user to verify/fix
const adminEmail = 'newadmin@example.com';

async function verifyAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: adminEmail });
    
    if (!user) {
      console.log(`User with email ${adminEmail} not found`);
      await mongoose.disconnect();
      return;
    }

    console.log('User found:');
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Is Admin: ${user.role === 'admin'}`);

    // If user is not an admin, update the role
    if (user.role !== 'admin') {
      console.log('Updating user role to admin...');
      user.role = 'admin';
      await user.save();
      console.log('User role updated to admin successfully');
    } else {
      console.log('User already has admin role');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error verifying admin user:', error);
    await mongoose.disconnect();
  }
}

// Run the function
verifyAdminUser(); 