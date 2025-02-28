const axios = require('axios');
const PIXABAY_CONFIG = require('../config/pixabay');

// Create an axios instance with default config
const pixabayClient = axios.create({
  baseURL: PIXABAY_CONFIG.BASE_URL,
  timeout: 10000, // 10 second timeout
  validateStatus: status => status === 200 // Only accept 200 status
});

class PixabayError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name = 'PixabayError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function getPixabayImage(searchTerm, retryCount = 3) {
  if (!searchTerm) {
    throw new PixabayError('Search term is required', 400);
  }

  let lastError = null;
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const params = {
        key: PIXABAY_CONFIG.API_KEY,
        q: encodeURIComponent(searchTerm),
        image_type: PIXABAY_CONFIG.IMAGE_TYPE,
        orientation: PIXABAY_CONFIG.ORIENTATION,
        safesearch: PIXABAY_CONFIG.SAFESEARCH,
        per_page: PIXABAY_CONFIG.PER_PAGE,
        lang: 'en' // Ensure English results
      };

      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const response = await pixabayClient.get(`?${queryString}`);

      // Check if we got a valid response
      if (!response.data) {
        throw new PixabayError('Invalid response from Pixabay', 500);
      }

      // Check rate limiting
      const rateLimit = {
        remaining: response.headers['x-ratelimit-remaining'],
        limit: response.headers['x-ratelimit-limit'],
        reset: response.headers['x-ratelimit-reset']
      };

      // Log rate limit info
      console.log('Pixabay rate limit:', rateLimit);

      if (rateLimit.remaining === '0') {
        throw new PixabayError('Rate limit exceeded', 429, {
          resetTime: rateLimit.reset
        });
      }

      // Check if we have results
      if (!response.data.hits || response.data.hits.length === 0) {
        console.log(`No images found for term: ${searchTerm}`);
        return null;
      }

      // Get random image from first 3 results for variety
      const randomIndex = Math.floor(Math.random() * Math.min(3, response.data.hits.length));
      return response.data.hits[randomIndex].webformatURL;

    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error.response?.status === 400 || // Bad request
          error.response?.status === 401 || // Unauthorized
          error.response?.status === 429) { // Rate limit
        throw new PixabayError(
          error.response.status === 429 ? 'Rate limit exceeded' : 'API request failed',
          error.response.status,
          error.response.data
        );
      }

      // Log the attempt
      console.error(`Pixabay API attempt ${attempt}/${retryCount} failed:`, error.message);

      // Wait before retrying (exponential backoff)
      if (attempt < retryCount) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If all retries failed
  throw new PixabayError(
    'Failed to fetch image after multiple attempts',
    500,
    { originalError: lastError?.message }
  );
}

module.exports = {
  getPixabayImage,
  PixabayError
}; 