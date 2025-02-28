const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/config');

// Email of the admin user
const adminEmail = 'newadmin@example.com';

async function generateAdminToken() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: adminEmail }).select('+password');
    
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

    // Generate a new token
    const token = user.getSignedJwtToken();
    console.log('\nNew token generated:');
    console.log(token);
    console.log('\nUse this token for authentication');
    console.log('You can check the token content with:');
    console.log(`node src/scripts/checkJwtToken.js ${token}`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error generating admin token:', error);
    await mongoose.disconnect();
  }
}

// Run the function
generateAdminToken(); 