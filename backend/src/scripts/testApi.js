const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Configure axios
axios.defaults.timeout = 10000; // 10 seconds timeout
axios.defaults.maxRetries = 3;
axios.defaults.retryDelay = 1000;

function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log('Token is valid');
    console.log('Decoded token payload:', decoded);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
}

async function retryRequest(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    console.log(`Request failed, retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
}

const API_URL = 'http://localhost:5001/api';

async function testApi() {
  try {
    // Generate unique email for admin user
    const uniqueEmail = `admin${Date.now()}@example.com`;

    // Test registration
    console.log('Testing registration...');
    const registrationResponse = await axios.post(`${API_URL}/users/register`, {
      name: 'Admin User',
      email: uniqueEmail,
      password: 'password123',
      role: 'admin'
    });
    console.log('Registration response:', JSON.stringify(registrationResponse.data, null, 2));

    // Test login
    console.log('\nTesting login...');
    const loginResponse = await axios.post(`${API_URL}/users/login`, {
      email: uniqueEmail,
      password: 'password123'
    });
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));

    // Get token from login response
    const token = loginResponse.data.data.token;

    // Verify token
    console.log('\nVerifying token...');
    const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('Token is valid');
    console.log('Decoded token payload:', decodedToken);

    // Get all categories to check if Animals exists
    console.log('\nChecking for existing Animals category...');
    const categoriesResponse = await axios.get(
      `${API_URL}/categories`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let categoryId;
    const existingCategory = categoriesResponse.data.data.find(cat => cat.name === 'Animals');

    if (existingCategory) {
      console.log('Found existing Animals category');
      categoryId = existingCategory._id;
    } else {
      // Create a category
      console.log('Creating new Animals category...');
      const categoryData = {
        name: 'Animals',
        description: 'Words related to animals',
        icon: '🦋',
        difficulty: 'beginner'
      };

      const categoryResponse = await axios.post(
        `${API_URL}/categories`,
        categoryData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Category creation response:', JSON.stringify(categoryResponse.data, null, 2));
      categoryId = categoryResponse.data.data._id;
    }

    // Test word creation with the category
    console.log('\nTesting word creation...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    console.log('Request headers:', headers);

    const wordData = {
      word: "cat",
      meaning: "A small domesticated carnivorous mammal",
      translation: "Con mèo",
      category: categoryId,
      examples: ["The cat is sleeping on the windowsill."],
      difficulty: "beginner",
      imageUrl: null
    };
    console.log('Word creation request data:', JSON.stringify(wordData, null, 2));

    const wordResponse = await axios.post(
      `${API_URL}/words`,
      wordData,
      { headers }
    );
    console.log('Word creation response:', JSON.stringify(wordResponse.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.error('Error:', {
        message: error.message,
        response: {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        },
        request: {
          method: error.response.config.method,
          url: error.response.config.url,
          data: error.response.config.data,
          headers: error.response.config.headers
        }
      });
    } else {
      console.error('Error:', error.message);
    }
  }
}

testApi(); 