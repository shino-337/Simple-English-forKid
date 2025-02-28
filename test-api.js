const http = require('http');

// Test user details
const testUser = {
  name: 'Full Flow Test User',
  email: 'fullflow@example.com',
  password: 'password123'
};

let authToken = '';

// Function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`\n${options.method} ${options.path} - STATUS: ${res.statusCode}`);
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log('Response headers:', res.headers);
        try {
          const parsedData = JSON.parse(responseData);
          console.log('Response body:', JSON.stringify(parsedData, null, 2));
          resolve(parsedData);
        } catch (e) {
          console.log('Response body (raw):', responseData);
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

// Base request options
const baseOptions = {
  hostname: 'localhost',
  port: 5001,
  headers: {
    'Content-Type': 'application/json'
  }
};

// 1. Register a new user
async function registerUser() {
  console.log('\n=== 1. REGISTERING USER ===');
  const data = JSON.stringify(testUser);
  
  const options = {
    ...baseOptions,
    path: '/api/users/register',
    method: 'POST',
    headers: {
      ...baseOptions.headers,
      'Content-Length': data.length
    }
  };

  const response = await makeRequest(options, data);
  if (response.success && response.data && response.data.token) {
    authToken = response.data.token;
    console.log('✅ Registration successful. Auth token received.');
  } else {
    console.log('❌ Registration failed or no token received.');
  }
  return response;
}

// 2. Login with registered user
async function loginUser() {
  console.log('\n=== 2. LOGGING IN USER ===');
  const data = JSON.stringify({
    email: testUser.email,
    password: testUser.password
  });
  
  const options = {
    ...baseOptions,
    path: '/api/users/login',
    method: 'POST',
    headers: {
      ...baseOptions.headers,
      'Content-Length': data.length
    }
  };

  const response = await makeRequest(options, data);
  if (response.success && response.data && response.data.token) {
    authToken = response.data.token;
    console.log('✅ Login successful. Auth token received.');
  } else {
    console.log('❌ Login failed or no token received.');
  }
  return response;
}

// 3. Get user profile
async function getUserProfile() {
  console.log('\n=== 3. GETTING USER PROFILE ===');
  const options = {
    ...baseOptions,
    path: '/api/users/me',
    method: 'GET',
    headers: {
      ...baseOptions.headers,
      'Authorization': `Bearer ${authToken}`
    }
  };

  const response = await makeRequest(options);
  if (response.success && response.data) {
    console.log('✅ Profile retrieved successfully.');
  } else {
    console.log('❌ Failed to retrieve profile.');
  }
  return response;
}

// 4. Update user progress
async function updateUserProgress() {
  console.log('\n=== 4. UPDATING USER PROGRESS ===');
  const data = JSON.stringify({
    wordId: '123',
    isLearned: true
  });
  
  const options = {
    ...baseOptions,
    path: '/api/users/progress',
    method: 'PUT',
    headers: {
      ...baseOptions.headers,
      'Authorization': `Bearer ${authToken}`,
      'Content-Length': data.length
    }
  };

  const response = await makeRequest(options, data);
  if (response.success) {
    console.log('✅ Progress updated successfully.');
  } else {
    console.log('❌ Failed to update progress.');
  }
  return response;
}

// Run the full test flow
async function runFullFlow() {
  try {
    console.log('🚀 Starting full API test flow...');
    
    await registerUser();
    await loginUser();
    await getUserProfile();
    await updateUserProgress();
    
    console.log('\n✅ Full API test flow completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during API test flow:', error);
  }
}

// Execute the full flow
runFullFlow(); 