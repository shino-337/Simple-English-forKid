const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: [true, 'Please provide a word'],
    trim: true
  },
  meaning: {
    type: String,
    required: [true, 'Please provide the meaning'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a category']
  },
  examples: {
    type: [String],
    default: []
  },
  // Uploaded image path
  imageUrl: {
    type: String,
    default: null // Will store the path to the uploaded image
  },
  // Learning progress
  learned: {
    type: Boolean,
    default: false
  },
  lastReviewed: {
    type: Date,
    default: null
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  audioUrl: {
    type: String, // Stores the path to the uploaded audio file
  },
  pronunciation: {
    type: String,
    trim: true
  },
  learnedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User'
  }
}, {
  timestamps: true
});

// For debugging - add a pre-save hook to log learnedBy users
wordSchema.pre('save', function(next) {
  if (this.isModified('learnedBy')) {
    console.log(`Word ${this._id} (${this.word}) - learnedBy updated: ${this.learnedBy.map(id => id.toString()).join(', ')}`);
  }
  next();
});

module.exports = mongoose.model('Word', wordSchema); 