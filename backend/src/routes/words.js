const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import controllers
const {
  getWords,
  getWordsByCategory,
  getWord,
  createWord,
  updateWord,
  deleteWord
} = require('../controllers/wordController');

// Public routes
router.get('/', getWords);
router.get('/category/:categoryId', getWordsByCategory);
router.get('/:id', getWord);

// Protected admin routes
router.post('/', protect, authorize('admin'), createWord);
router.put('/:id', protect, authorize('admin'), updateWord);
router.delete('/:id', protect, authorize('admin'), deleteWord);

module.exports = router; 