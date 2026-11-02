const express = require('express');
const { updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
