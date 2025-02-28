const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { sampleWords } = require('./addSampleWords');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../../public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configure axios with proxy
const axiosInstance = axios.create({
  proxy: {
    host: 'host.docker.internal',
    port: 8081,
    protocol: 'socks5'
  },
  timeout: 30000
});

// Sample image URLs from a reliable CDN
const sampleImageUrls = {
  'lion': 'https://cdn.pixabay.com/photo/2018/07/31/22/08/lion-3576045_640.jpg',
  'elephant': 'https://cdn.pixabay.com/photo/2016/11/14/04/45/elephant-1822636_640.jpg',
  'red': 'https://cdn.pixabay.com/photo/2016/12/15/20/21/texture-1909992_640.jpg',
  'blue': 'https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_640.jpg',
  'pizza': 'https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_640.jpg',
  'water': 'https://cdn.pixabay.com/photo/2014/12/24/05/02/drop-of-water-578897_640.jpg'
};

const downloadImage = async (word) => {
  try {
    const filename = `${word.toLowerCase()}.jpg`;
    const filepath = path.join(imagesDir, filename);

    // Remove existing file if it exists
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`Removed existing image for ${word}`);
    }

    const imageUrl = sampleImageUrls[word.toLowerCase()];
    if (!imageUrl) {
      console.log(`No sample image URL for ${word}`);
      return;
    }

    console.log(`Downloading image for ${word} from ${imageUrl}...`);
    
    // Download the image using proxy
    const response = await axiosInstance.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    // Save the image
    fs.writeFileSync(filepath, response.data);
    console.log(`Successfully downloaded image for ${word} (${response.data.length} bytes)`);
  } catch (error) {
    console.error(`Error downloading image for ${word}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    if (error.request) {
      console.error('Request config:', error.request._currentRequest);
    }
  }
};

const downloadAllImages = async () => {
  for (const [category, words] of Object.entries(sampleWords)) {
    console.log(`\nDownloading images for ${category}...`);
    for (const wordData of words) {
      await downloadImage(wordData.word);
      // Add a small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Run the script if called directly
if (require.main === module) {
  downloadAllImages()
    .then(() => {
      console.log('\nFinished downloading all images');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { downloadAllImages }; 