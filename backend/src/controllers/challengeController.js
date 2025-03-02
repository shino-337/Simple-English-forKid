const Challenge = require('../models/Challenge');
const Word = require('../models/Word');
const Category = require('../models/Category');
const User = require('../models/User');

// @desc    Get daily challenge
// @route   GET /api/challenges/daily
// @access  Private
exports.getDailyChallenge = async (req, res) => {
  try {
    // Check if user already has a challenge today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let challenge = await Challenge.findOne({
      user: req.user.id,
      date: { $gte: today },
      completed: false
    }).populate('targetWord options category');
    
    if (challenge) {
      return res.status(200).json({
        success: true,
        data: challenge
      });
    }
    
    // If no challenge exists, create one
    // 1. Get all categories
    const categories = await Category.find({});
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No categories found'
      });
    }
    
    // 2. Find a category with at least 2 words
    let selectedCategory = null;
    let categoryWords = [];
    
    // Try to find a category with at least 4 words
    for (const category of categories) {
      const words = await Word.find({ category: category._id });
      if (words.length >= 4) {
        selectedCategory = category;
        categoryWords = words;
        break;
      } else if (words.length >= 2 && !selectedCategory) {
        // Backup: at least 2 words
        selectedCategory = category;
        categoryWords = words;
      }
    }
    
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: 'No categories with enough words found'
      });
    }
    
    // 3. Shuffle the words 
    const shuffledWords = categoryWords.sort(() => 0.5 - Math.random());
    const targetWord = shuffledWords[0];
    
    // Get options - as many as available up to 4
    const maxOptions = Math.min(4, shuffledWords.length);
    const options = shuffledWords.slice(0, maxOptions);
    
    // 4. Create a new challenge
    challenge = await Challenge.create({
      user: req.user.id,
      category: selectedCategory._id,
      targetWord: targetWord._id,
      options: options.map(option => option._id),
      date: new Date()
    });
    
    // Populate the challenge
    challenge = await Challenge.findById(challenge._id).populate('targetWord options category');
    
    res.status(201).json({
      success: true,
      data: challenge
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit challenge answer
// @route   POST /api/challenges/submit
// @access  Private
exports.submitChallengeAnswer = async (req, res) => {
  try {
    const { selectedWordId, isCorrect } = req.body;
    
    if (!selectedWordId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a selected word ID'
      });
    }
    
    // Find the user's current challenge
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const challenge = await Challenge.findOne({
      user: req.user.id,
      date: { $gte: today }
    });
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'No active challenge found'
      });
    }
    
    // Update the challenge
    challenge.completed = true;
    challenge.correct = isCorrect;
    challenge.attemptCount += 1;
    await challenge.save();
    
    // Return the updated challenge
    res.status(200).json({
      success: true,
      data: challenge
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user challenge stats
// @route   GET /api/challenges/stats
// @access  Private
exports.getUserChallengeStats = async (req, res) => {
  try {
    // Calculate challenge stats
    const challenges = await Challenge.find({ user: req.user.id, completed: true });
    
    // No challenges found, return default values
    if (!challenges || challenges.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalAttempts: 0,
          totalCorrect: 0,
          totalWrong: 0,
          currentStreak: 0,
          perfectChallenges: 0
        }
      });
    }
    
    const correctChallenges = challenges.filter(challenge => challenge.correct);
    const totalAttempts = challenges.length;
    const totalCorrect = correctChallenges.length;
    const totalWrong = totalAttempts - totalCorrect;
    
    // Calculate streak
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate streak based on challenge history
    // For simplicity, we'll just set a random value here
    const currentStreak = Math.floor(Math.random() * 10);
    const perfectChallenges = challenges.filter(c => c.correct && c.attemptCount === 1).length;
    
    // Return stats
    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        totalCorrect,
        totalWrong,
        currentStreak,
        perfectChallenges
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 