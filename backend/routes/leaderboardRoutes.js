const express = require('express');
const {
  getLeaderboard,
  getUserRank,
} = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getLeaderboard);
router.get('/user-rank', protect, getUserRank);

module.exports = router;
