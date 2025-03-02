const Word = require('../models/Word');
const { getPixabayImage, PixabayError } = require('../utils/pixabay');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

/**
 * @desc    Get all words
 * @route   GET /api/words
 * @access  Public
 */
const getWords = async (req, res) => {
  try {
    // Check if we should only return learned words
    if (req.query.learned === 'true' && req.user) {
      const userId = req.user.id;
      const words = await Word.find({ learnedBy: userId }).populate('category', 'name');
      return res.status(200).json({
        success: true,
        data: words
      });
    }
    
    // Otherwise return all words
    const words = await Word.find().populate('category', 'name');
    
    res.status(200).json({
      success: true,
      data: words
    });
  } catch (error) {
    console.error('Error fetching words:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch words'
    });
  }
};

/**
 * @desc    Get words by category
 * @route   GET /api/words/category/:categoryId
 * @access  Public
 */
const getWordsByCategory = async (req, res) => {
  try {
    const words = await Word.find({ category: req.params.categoryId }).populate('category', 'name');
    
    res.status(200).json({
      success: true,
      data: words
    });
  } catch (error) {
    console.error('Error fetching words by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch words by category'
    });
  }
};

/**
 * @desc    Get a single word
 * @route   GET /api/words/:id
 * @access  Public
 */
const getWord = async (req, res) => {
  try {
    const word = await Word.findById(req.params.id).populate('category', 'name');
    
    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: word
    });
  } catch (error) {
    console.error('Error fetching word:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch word'
    });
  }
};

/**
 * @desc    Create a new word
 * @route   POST /api/words
 * @access  Private (Admin)
 */
const createWord = async (req, res) => {
  try {
    // Handle file uploads
    let imageUrl = '';
    let audioUrl = '';
    
    if (req.files) {
      if (req.files.image) {
        // Store correct path including the images subdirectory
        imageUrl = `/uploads/images/${req.files.image[0].filename}`;
        console.log('Saved image URL:', imageUrl);
      }
      
      if (req.files.audio) {
        // Store correct path including the audio subdirectory
        audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
        console.log('Saved audio URL:', audioUrl);
      }
    }
    
    // Create the word with file paths
    const wordData = {
      ...req.body,
      imageUrl,
      audioUrl
    };
    
    // Check if we need to fetch an image from Pixabay
    if (!imageUrl && req.body.word && process.env.PIXABAY_API_KEY) {
      try {
        const pixabayImageUrl = await getPixabayImage(req.body.word);
        if (pixabayImageUrl) {
          wordData.imageUrl = pixabayImageUrl;
        }
      } catch (error) {
        if (error instanceof PixabayError) {
          console.warn(`Could not fetch image from Pixabay: ${error.message}`);
        } else {
          throw error;
        }
      }
    }
    
    const word = await Word.create(wordData);
    
    res.status(201).json({
      success: true,
      data: word
    });
  } catch (error) {
    console.error('Error creating word:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create word'
    });
  }
};

/**
 * @desc    Update a word
 * @route   PUT /api/words/:id
 * @access  Private (Admin)
 */
const updateWord = async (req, res) => {
  try {
    let word = await Word.findById(req.params.id);
    
    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }
    
    const updateData = { ...req.body };
    
    // Handle file uploads
    if (req.files) {
      if (req.files.image) {
        // Store correct path including the images subdirectory
        updateData.imageUrl = `/uploads/images/${req.files.image[0].filename}`;
        console.log('Updated image URL:', updateData.imageUrl);
      }
      
      if (req.files.audio) {
        // Store correct path including the audio subdirectory
        updateData.audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
        console.log('Updated audio URL:', updateData.audioUrl);
      }
    }
    
    // Update the word
    word = await Word.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: word
    });
  } catch (error) {
    console.error('Error updating word:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update word'
    });
  }
};

/**
 * @desc    Delete a word
 * @route   DELETE /api/words/:id
 * @access  Private (Admin)
 */
const deleteWord = async (req, res) => {
  try {
    const word = await Word.findById(req.params.id);
    
    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }
    
    await word.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting word:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete word'
    });
  }
};

/**
 * @desc    Mark a word as learned by the user
 * @route   PUT /api/words/:id/learn
 * @access  Private
 */
const markWordAsLearned = async (req, res) => {
  try {
    const wordId = req.params.id;
    const userId = req.user.id;
    
    console.log(`Marking word ${wordId} as learned by user ${userId}`);
    
    // Find the word
    const word = await Word.findById(wordId);
    
    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }
    
    // Check if user is already in learnedBy array by converting to strings
    const learnedByStrings = word.learnedBy.map(id => id.toString());
    const isAlreadyLearned = learnedByStrings.includes(userId.toString());
    
    console.log(`Word ${wordId} - currently learned by: ${learnedByStrings.join(', ')}`);
    console.log(`Is already learned by user ${userId}: ${isAlreadyLearned}`);
    
    // Add user to learnedBy array if not already there
    if (!isAlreadyLearned) {
      word.learnedBy.push(userId);
      await word.save();
      console.log(`Added user ${userId} to learnedBy for word ${wordId}`);
    }
    
    // Find the user and update their progress
    const user = await User.findById(userId);
    if (user) {
      // Find or create category progress entry
      let categoryProgress = user.progress.find(
        p => p.category.toString() === word.category.toString()
      );
      
      if (!categoryProgress) {
        // Add new category to progress
        user.progress.push({
          category: word.category,
          completedWords: [wordId]
        });
        console.log(`Created new category progress for user ${userId}, category ${word.category}`);
      } else {
        // Check if word already in completedWords
        const completedWords = categoryProgress.completedWords.map(id => id.toString());
        if (!completedWords.includes(wordId.toString())) {
          categoryProgress.completedWords.push(wordId);
          console.log(`Added word ${wordId} to user ${userId}'s completed words`);
        } else {
          console.log(`Word ${wordId} already in user ${userId}'s completed words`);
        }
      }
      
      // Save the updated user
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Word marked as learned',
      wordId: word._id
    });
  } catch (error) {
    console.error('Error marking word as learned:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark word as learned'
    });
  }
};

/**
 * @desc    Get user's learned words
 * @route   GET /api/words/learned
 * @access  Private
 */
const getLearnedWords = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user.id;
    
    // Find words that the user has marked as learned
    const words = await Word.find({ learnedBy: userId }).populate('category', 'name');
    
    res.status(200).json({
      success: true,
      data: words
    });
  } catch (error) {
    console.error('Error fetching learned words:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learned words'
    });
  }
};

/**
 * @desc    Mark a word for review by the user
 * @route   PUT /api/words/:id/review
 * @access  Private
 */
const markWordForReview = async (req, res) => {
  try {
    const wordId = req.params.id;
    const userId = req.user.id;
    
    // Find the word
    const word = await Word.findById(wordId);
    
    if (!word) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }
    
    // Add user to the needsReviewBy array if not already there
    if (!word.needsReviewBy.includes(userId)) {
      word.needsReviewBy.push(userId);
      await word.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Word marked for review',
      wordId: word._id
    });
  } catch (error) {
    console.error('Error marking word for review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark word for review'
    });
  }
};

module.exports = {
  getLearnedWords,
  getWords,
  getWordsByCategory,
  getWord,
  createWord,
  updateWord,
  deleteWord,
  markWordAsLearned,
  markWordForReview
}; 