const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProgressStats,
  getCategoryProgress,
  getStudyHistory,
  recordStudySession,
  updatePreferences
} = require('../controllers/progressController');

// All routes are protected
router.use(protect);

// Progress routes
router.get('/stats', getProgressStats);
router.get('/categories', getCategoryProgress);
router.get('/history', getStudyHistory);
router.post('/record-session', recordStudySession);
router.put('/preferences', updatePreferences);

module.exports = router; 