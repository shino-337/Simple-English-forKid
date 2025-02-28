const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Function to decode a JWT token
function decodeToken(token) {
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log('Token is valid');
    console.log('Decoded token payload:');
    console.log(JSON.stringify(decoded, null, 2));
    
    // Check if role is included in the token
    if (decoded.role) {
      console.log(`Role in token: ${decoded.role}`);
      console.log(`Is Admin: ${decoded.role === 'admin'}`);
    } else {
      console.log('Role is not included in the token!');
    }
    
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
}

// Example token (replace with your actual token)
const token = process.argv[2];

if (!token) {
  console.log('Please provide a token as an argument');
  console.log('Usage: node checkJwtToken.js YOUR_TOKEN_HERE');
} else {
  decodeToken(token);
} 