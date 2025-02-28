const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  targetWord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word',
    required: true
  },
  options: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word'
  }],
  completed: {
    type: Boolean,
    default: false
  },
  correct: {
    type: Boolean,
    default: false
  },
  attemptCount: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Challenge', challengeSchema); 