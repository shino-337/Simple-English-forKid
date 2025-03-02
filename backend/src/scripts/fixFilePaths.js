const mongoose = require('mongoose');
const Word = require('../models/Word');
const config = require('../config/config');

// Function to update the file paths in the database
async function fixFilePaths() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB Connected...');

    // Find all words with paths that need updating
    const words = await Word.find({
      $or: [
        { imageUrl: { $regex: '^/uploads/[^/]+$' } },  // Matches /uploads/filename but not /uploads/images/filename
        { audioUrl: { $regex: '^/uploads/[^/]+$' } }   // Matches /uploads/filename but not /uploads/audio/filename
      ]
    });

    console.log(`Found ${words.length} words that need path updates`);

    // Update each word with correct paths
    let updatedCount = 0;
    for (const word of words) {
      let updated = false;
      
      // Fix image URL
      if (word.imageUrl && word.imageUrl.startsWith('/uploads/') && !word.imageUrl.includes('/uploads/images/')) {
        const filename = word.imageUrl.split('/').pop();
        word.imageUrl = `/uploads/images/${filename}`;
        updated = true;
      }
      
      // Fix audio URL
      if (word.audioUrl && word.audioUrl.startsWith('/uploads/') && !word.audioUrl.includes('/uploads/audio/')) {
        const filename = word.audioUrl.split('/').pop();
        word.audioUrl = `/uploads/audio/${filename}`;
        updated = true;
      }
      
      if (updated) {
        await word.save();
        updatedCount++;
        console.log(`Updated word "${word.word}" (ID: ${word._id})`);
        console.log(`  - Image path: ${word.imageUrl}`);
        console.log(`  - Audio path: ${word.audioUrl}`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} words`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
    
  } catch (error) {
    console.error('Error updating file paths:', error);
    process.exit(1);
  }
}

// Run the function
fixFilePaths(); 