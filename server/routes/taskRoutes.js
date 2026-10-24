const express = require('express');
const router = express.Router();
const {
  getProjectTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  uploadAttachment,
  getTaskActivity,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/').post(protect, createTask);
router.route('/project/:projectId').get(protect, getProjectTasks);
router.route('/:id').get(protect, getTaskById).put(protect, updateTask).delete(protect, deleteTask);
router.route('/:id/status').patch(protect, updateTaskStatus);
router.route('/:id/attachments').post(protect, upload.single('file'), uploadAttachment);
router.route('/:id/activity').get(protect, getTaskActivity);

module.exports = router;
