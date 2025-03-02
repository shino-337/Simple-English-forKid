const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, avatar, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',  // Allow setting role, default to 'user'
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
    });

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          isAdmin: user.role === 'admin',
          isFirstTime: true,
          progress: {
            completedWords: 0,
            completedCategories: 0,
            streakDays: 0,
            lastActiveDate: new Date().toISOString().split('T')[0]
          }
        },
        token
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

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          isAdmin: user.role === 'admin',
          isFirstTime: false,
          progress: {
            completedWords: user.progress.length > 0 ? user.progress.reduce((acc, curr) => acc + curr.completedWords.length, 0) : 0,
            completedCategories: user.progress.length,
            streakDays: 0, // This would need additional tracking
            lastActiveDate: new Date().toISOString().split('T')[0]
          }
        },
        token
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

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isAdmin: user.role === 'admin',
        isFirstTime: false,
        progress: {
          completedWords: user.progress.length > 0 ? user.progress.reduce((acc, curr) => acc + curr.completedWords.length, 0) : 0,
          completedCategories: user.progress.length,
          streakDays: 0, // This would need additional tracking
          lastActiveDate: new Date().toISOString().split('T')[0]
        }
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (avatar) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isAdmin: user.role === 'admin',
        isFirstTime: false,
        progress: {
          completedWords: user.progress.length > 0 ? user.progress.reduce((acc, curr) => acc + curr.completedWords.length, 0) : 0,
          completedCategories: user.progress.length,
          streakDays: 0,
          lastActiveDate: new Date().toISOString().split('T')[0]
        }
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

// @desc    Update user progress
// @route   PUT /api/users/progress
// @access  Private
exports.updateUserProgress = async (req, res) => {
  try {
    const { categoryId, wordId } = req.body;

    // Find the user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find or create category progress
    let categoryProgress = user.progress.find(
      p => p.category.toString() === categoryId
    );

    if (!categoryProgress) {
      // Add new category to progress
      user.progress.push({
        category: categoryId,
        completedWords: [wordId]
      });
    } else {
      // Check if word already completed
      if (!categoryProgress.completedWords.includes(wordId)) {
        categoryProgress.completedWords.push(wordId);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        progress: user.progress
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