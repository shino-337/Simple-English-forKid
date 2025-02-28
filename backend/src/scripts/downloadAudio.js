const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Function to ensure directory exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Function to generate audio using text-to-speech
const generateAudio = async (text, outputPath) => {
  try {
    // Using say command on macOS (for demo purposes)
    // In production, you'd use a proper TTS service
    await execAsync(`say -v Alex "${text}" -o "${outputPath}"`);
    console.log(`Generated audio for: ${text}`);
  } catch (error) {
    console.error(`Error generating audio for ${text}:`, error);
  }
};

// Get the list of words from our seed data
const { demoWords } = require('./seedDemoData');

const generateAllAudio = async () => {
  // Create uploads directory if it doesn't exist
  const audioDir = path.join(__dirname, '../../public/uploads/audio');
  ensureDir(audioDir);

  // Generate audio for each word
  for (const [category, words] of Object.entries(demoWords)) {
    for (const word of words) {
      const fileName = `${category.toLowerCase()}-${word.word.toLowerCase()}.mp3`;
      const outputPath = path.join(audioDir, fileName);
      
      if (!fs.existsSync(outputPath)) {
        await generateAudio(word.word, outputPath);
      }
    }
  }

  console.log('Audio generation completed!');
};

generateAllAudio(); 