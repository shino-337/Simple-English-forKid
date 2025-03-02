const User = require('../models/User');
const Word = require('../models/Word');
const Category = require('../models/Category');
const Challenge = require('../models/Challenge');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user progress statistics
// @route   GET /api/progress/stats
// @access  Private
exports.getProgressStats = asyncHandler(async (req, res, next) => {
  // Get the full user document with populated data
  const user = await User.findById(req.user.id)
    .populate({
      path: 'progress.category',
      select: 'name imageUrl'
    })
    .populate({
      path: 'studyHistory.category',
      select: 'name'
    });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  console.log(`Getting progress stats for user ${user._id}`);

  // Get words the user has marked as learned directly from the Word model
  // Get them all so we can print details for debugging
  const learnedWords = await Word.find({ learnedBy: { $in: [user._id] } });
  const learnedWordsCount = learnedWords.length;
  
  console.log(`Debug - User ${user._id} - Words marked as learned: ${learnedWordsCount}`);
  console.log(`Debug - Word IDs: ${learnedWords.map(w => w._id).join(', ')}`);

  // Calculate total words learned from user progress
  const progressWords = [];
  let categoryDebug = [];
  
  user.progress.forEach(category => {
    if (category.completedWords && category.completedWords.length > 0) {
      const categoryWords = [];
      
      category.completedWords.forEach(wordId => {
        const wordIdStr = wordId.toString();
        if (!progressWords.includes(wordIdStr)) {
          progressWords.push(wordIdStr);
          categoryWords.push(wordIdStr);
        }
      });
      
      const categoryName = category.category?.name || 'Unknown';
      categoryDebug.push(`${categoryName}: ${categoryWords.length} words`);
    }
  });
  
  const progressWordsLearned = progressWords.length;
  
  console.log(`Debug - User ${user._id} - Words in progress: ${progressWordsLearned}`);
  console.log(`Debug - Categories: ${categoryDebug.join(', ')}`);

  // Use the higher count - ensures we don't miss any learned words
  const totalWordsLearned = Math.max(learnedWordsCount, progressWordsLearned);
  
  console.log(`Debug - User ${user._id} - Final total words: ${totalWordsLearned}`);

  // Calculate total categories with at least one word learned
  const categoriesWithProgress = user.progress.filter(item => 
    item.completedWords && item.completedWords.length > 0
  ).length;

  // Get study sessions from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentStudySessions = user.studyHistory.filter(session => 
    new Date(session.date) >= thirtyDaysAgo
  );

  // Calculate words learned per day for the last 30 days
  const wordsPerDay = {};
  recentStudySessions.forEach(session => {
    const dateStr = new Date(session.date).toISOString().split('T')[0];
    wordsPerDay[dateStr] = (wordsPerDay[dateStr] || 0) + (session.wordsLearned?.length || 0);
  });

  // Format for chart display
  const wordsPerDayArray = Object.keys(wordsPerDay).map(date => ({
    date,
    count: wordsPerDay[date]
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate total study time
  const totalStudyTime = user.statistics?.totalTimeSpent || 
    user.studyHistory.reduce((total, session) => total + (session.timeSpent || 0), 0);

  // Get challenges data
  const challenges = await Challenge.find({ user: req.user.id });
  const totalChallenges = challenges.length;
  const correctChallenges = challenges.filter(challenge => challenge.correct).length;
  const accuracy = totalChallenges > 0 ? (correctChallenges / totalChallenges) * 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      totalWordsLearned,
      categoriesWithProgress,
      streakDays: user.statistics?.streakDays || 0,
      wordsPerDay: wordsPerDayArray,
      totalStudyTime,
      studySessionCount: user.studyHistory.length,
      challengeStats: {
        totalChallenges,
        correctChallenges,
        accuracy: Math.round(accuracy)
      },
      lastActiveDate: user.statistics?.lastActiveDate
    }
  });
});

// @desc    Get detailed category progress
// @route   GET /api/progress/categories
// @access  Private
exports.getCategoryProgress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'progress.category',
    select: 'name imageUrl description'
  });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Get all categories
  const allCategories = await Category.find();
  
  // Map categories with progress data
  const categoriesWithProgress = await Promise.all(
    allCategories.map(async (category) => {
      // Find user progress for this category
      const progress = user.progress.find(
        p => p.category && p.category._id.toString() === category._id.toString()
      );
      
      // Get total words in this category
      const totalWords = await Word.countDocuments({ category: category._id });
      
      // Calculate completion percentage
      const completedWords = progress ? progress.completedWords.length : 0;
      const completionPercentage = totalWords > 0 
        ? Math.round((completedWords / totalWords) * 100) 
        : 0;
      
      return {
        _id: category._id,
        name: category.name,
        imageUrl: category.imageUrl,
        description: category.description,
        totalWords,
        completedWords,
        completionPercentage
      };
    })
  );

  res.status(200).json({
    success: true,
    data: categoriesWithProgress
  });
});

// @desc    Get study history
// @route   GET /api/progress/history
// @access  Private
exports.getStudyHistory = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'studyHistory.category',
      select: 'name imageUrl'
    })
    .populate({
      path: 'studyHistory.wordsLearned',
      select: 'word translation'
    });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Sort study history by date (newest first)
  const sortedHistory = [...user.studyHistory].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  res.status(200).json({
    success: true,
    data: sortedHistory
  });
});

// @desc    Record study session
// @route   POST /api/progress/record-session
// @access  Private
exports.recordStudySession = asyncHandler(async (req, res, next) => {
  const { categoryId, wordsStudied, wordsLearned, timeSpent } = req.body;

  if (!categoryId || !Array.isArray(wordsStudied)) {
    return next(new ErrorResponse('Please provide category and words studied', 400));
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Update user streak
  user.updateStreak();

  // Create new study session
  const newSession = {
    date: new Date(),
    category: categoryId,
    wordsStudied: wordsStudied,
    wordsLearned: wordsLearned || [],
    timeSpent: timeSpent || 0
  };

  // Add to study history
  user.studyHistory.push(newSession);

  // Update statistics
  if (!user.statistics) {
    user.statistics = {};
  }

  // Update total time spent
  user.statistics.totalTimeSpent = (user.statistics.totalTimeSpent || 0) + (timeSpent || 0);

  // Update words per day
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = user.statistics.wordsPerDay?.find(
    entry => new Date(entry.date).toISOString().split('T')[0] === today
  );

  if (todayEntry) {
    todayEntry.count += wordsLearned?.length || 0;
  } else {
    if (!user.statistics.wordsPerDay) {
      user.statistics.wordsPerDay = [];
    }
    user.statistics.wordsPerDay.push({
      date: new Date(),
      count: wordsLearned?.length || 0
    });
  }

  // Check if daily goal was met
  const todayLearnedCount = user.statistics.wordsPerDay?.find(
    entry => new Date(entry.date).toISOString().split('T')[0] === today
  )?.count || 0;

  if (todayLearnedCount >= user.preferences?.dailyWordGoal) {
    user.statistics.dailyGoals += 1;
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      session: newSession,
      statistics: user.statistics
    }
  });
});

// @desc    Update user preferences
// @route   PUT /api/progress/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  const { dailyWordGoal, studyReminders, difficulty } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Initialize preferences if not exists
  if (!user.preferences) {
    user.preferences = {};
  }

  // Update preferences
  if (dailyWordGoal !== undefined) {
    user.preferences.dailyWordGoal = dailyWordGoal;
  }
  
  if (studyReminders !== undefined) {
    user.preferences.studyReminders = studyReminders;
  }
  
  if (difficulty !== undefined) {
    user.preferences.difficulty = difficulty;
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user.preferences
  });
}); 