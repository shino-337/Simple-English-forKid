const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { wordUpload } = require('../middleware/upload');

// Import controllers
const {
  getWords,
  getWordsByCategory,
  getWord,
  createWord,
  updateWord,
  deleteWord,
  markWordAsLearned,
  getLearnedWords,
  markWordForReview
} = require('../controllers/wordController');

// Public routes
router.get('/', getWords);
router.get('/category/:categoryId', getWordsByCategory);

// User routes - These need to be before the /:id route
router.get('/learned', protect, getLearnedWords);
router.put('/:id/learn', protect, markWordAsLearned);
router.put('/:id/review', protect, markWordForReview);

// Single word route - This should come after other specific routes
router.get('/:id', getWord);

// Protected admin routes
router.post('/', protect, authorize('admin'), wordUpload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), createWord);

router.put('/:id', protect, authorize('admin'), wordUpload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), updateWord);

router.delete('/:id', protect, authorize('admin'), deleteWord);

module.exports = router; 