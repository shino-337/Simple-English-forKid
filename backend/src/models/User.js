const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  progress: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    completedWords: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word'
    }]
  }],
  studyHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    wordsStudied: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word'
    }],
    wordsLearned: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word'
    }],
    timeSpent: {
      type: Number,
      default: 0 // Time spent in seconds
    }
  }],
  statistics: {
    totalTimeSpent: {
      type: Number,
      default: 0 // Total time spent studying in seconds
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    },
    streakDays: {
      type: Number,
      default: 0
    },
    dailyGoals: {
      type: Number,
      default: 0 // Number of days the user met their daily goal
    },
    wordsPerDay: [{
      date: {
        type: Date
      },
      count: {
        type: Number,
        default: 0
      }
    }]
  },
  preferences: {
    dailyWordGoal: {
      type: Number,
      default: 5
    },
    studyReminders: {
      type: Boolean,
      default: true
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpires }
  );
};

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update streak when user is active
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = new Date(this.statistics.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // If last active was today, do nothing
  if (lastActive.getTime() === today.getTime()) {
    return;
  }
  
  // If last active was yesterday, increment streak
  if (lastActive.getTime() === yesterday.getTime()) {
    this.statistics.streakDays += 1;
  } else {
    // If last active was before yesterday, reset streak
    this.statistics.streakDays = 1;
  }
  
  this.statistics.lastActiveDate = today;
};

module.exports = mongoose.model('User', userSchema); 