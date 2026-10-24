const express = require('express');
const router = express.Router();
const { getDashboardStats, getMyTasks } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/my-tasks', protect, getMyTasks);

module.exports = router;
