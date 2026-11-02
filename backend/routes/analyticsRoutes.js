const express = require('express');
const { getActivityAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/activity', protect, getActivityAnalytics);

module.exports = router;
