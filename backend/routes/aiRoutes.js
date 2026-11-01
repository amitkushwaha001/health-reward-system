const express = require('express');
const {
  getInsights,
  generateRecommendations,
  getRecommendations,
  getRecommendationHistory,
  updateRecommendationStatus,
  getChatHistory,
  sendChatMessage,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiters');

const router = express.Router();
router.use(protect);

router.get('/insights', getInsights);
router.get('/recommendations', getRecommendations);
router.post('/recommendations/generate', aiLimiter, generateRecommendations);
router.get('/recommendations/history', getRecommendationHistory);
router.patch('/recommendations/:id/status', updateRecommendationStatus);
router.get('/chat/history', getChatHistory);
router.post('/chat', aiLimiter, sendChatMessage);

module.exports = router;
