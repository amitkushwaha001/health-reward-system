const express = require('express');
const {
  addSteps,
  getStepHistory,
  updateSteps,
  deleteSteps,
} = require('../controllers/stepController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/add', protect, addSteps);
router.get('/history', protect, getStepHistory);
router.put('/update/:id', protect, updateSteps);
router.delete('/delete/:id', protect, deleteSteps);

module.exports = router;
