const express = require('express');
const {
  getDashboardStats,
  getUsers,
  deleteUser,
  blockUser,
  createReward,
  updateReward,
  deleteReward,
  getReports,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Middleware to protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users management
router.get('/users', getUsers);
router.delete('/user/:id', deleteUser);
router.patch('/block/:id', blockUser);

// Rewards management
router.post('/rewards', createReward);
router.put('/rewards/:id', updateReward);
router.delete('/rewards/:id', deleteReward);

// Reports
router.get('/reports', getReports);

module.exports = router;
