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
  translation: {
    type: String,
    required: [true, 'Please provide the translation'],
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
  // Pixabay image URLs
  imageUrl: {
    type: String,
    default: null // Will be populated from Pixabay
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
    type: String, // Can be either a full URL (for CDN/external audio) or a relative path (/audio/word.mp3)
  },
  pronunciation: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Word', wordSchema); 