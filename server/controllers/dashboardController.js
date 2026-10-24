const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard stats for current user
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  // Find all projects where user is owner or member
  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
  }).select('_id');

  const projectIds = projects.map((p) => p._id);
  const totalProjects = projectIds.length;

  // Get all tasks for those projects
  const tasks = await Task.find({ project: { $in: projectIds } });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== 'done'
  ).length;

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    inprogress: tasks.filter((t) => t.status === 'inprogress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  // Recent activity (last 10 entries for user's projects)
  const recentActivity = await ActivityLog.find({ project: { $in: projectIds } })
    .populate('user', 'name email avatar')
    .populate('task', 'title')
    .populate('project', 'title')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    totalProjects,
    totalTasks,
    completedTasks,
    overdueTasks,
    tasksByStatus,
    recentActivity,
  });
});

// @desc    Get my tasks (assigned to current user, not done)
// @route   GET /api/dashboard/my-tasks
// @access  Private
const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    assignee: req.user._id,
    status: { $ne: 'done' },
  })
    .populate('project', 'title')
    .populate('assignee', 'name email avatar')
    .sort({ dueDate: 1, createdAt: -1 });

  res.json(tasks);
});

module.exports = { getDashboardStats, getMyTasks };
