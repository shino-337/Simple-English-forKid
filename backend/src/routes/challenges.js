const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getDailyChallenge,
  submitChallengeAnswer,
  getUserChallengeStats
} = require('../controllers/challengeController');

// Challenge routes
router.get('/daily', protect, getDailyChallenge);
router.post('/submit', protect, submitChallengeAnswer);
router.get('/stats', protect, getUserChallengeStats);

module.exports = router; 