const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');
const { logActivity, createNotification } = require('../services/activityService');

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getProjectTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ project: req.params.projectId })
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort({ order: 1, createdAt: -1 });

  res.json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, project, assignee, priority, status, dueDate } = req.body;

  if (!title || !project) {
    res.status(400);
    throw new Error('Title and project are required');
  }

  const projectDoc = await Project.findById(project);
  if (!projectDoc) {
    res.status(404);
    throw new Error('Project not found');
  }

  const taskCount = await Task.countDocuments({ project });

  const task = await Task.create({
    title,
    description,
    project,
    assignee: assignee || null,
    createdBy: req.user._id,
    priority: priority || 'medium',
    status: status || 'todo',
    dueDate: dueDate || null,
    order: taskCount,
  });

  await logActivity({
    taskId: task._id,
    projectId: project,
    userId: req.user._id,
    action: 'created task',
    details: `Task "${title}" was created`,
  });

  // Notify assignee if different from creator
  if (assignee && assignee.toString() !== req.user._id.toString()) {
    await createNotification({
      userId: assignee,
      message: `You have been assigned to task "${title}"`,
      type: 'task_assigned',
      link: `/projects/${project}`,
    });
  }

  const populated = await task.populate([
    { path: 'assignee', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
  ]);

  res.status(201).json(populated);
});

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'title');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  res.json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const fieldsToTrack = ['title', 'description', 'assignee', 'priority', 'status', 'dueDate'];
  const changes = [];

  for (const field of fieldsToTrack) {
    if (req.body[field] !== undefined) {
      const oldVal = task[field]?.toString() || '';
      const newVal = req.body[field]?.toString() || '';
      if (oldVal !== newVal) {
        changes.push(`${field}: "${oldVal}" → "${newVal}"`);
      }
      task[field] = req.body[field];
    }
  }

  if (req.body.order !== undefined) task.order = req.body.order;

  const updated = await task.save();

  if (changes.length > 0) {
    await logActivity({
      taskId: task._id,
      projectId: task.project,
      userId: req.user._id,
      action: 'updated task',
      details: changes.join('; '),
    });
  }

  const populated = await updated.populate([
    { path: 'assignee', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
  ]);

  res.json(populated);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await logActivity({
    projectId: task.project,
    userId: req.user._id,
    action: 'deleted task',
    details: `Task "${task.title}" was deleted`,
  });

  await task.deleteOne();
  res.json({ message: 'Task deleted successfully' });
});

// @desc    Update task status (Kanban drag-and-drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status, order } = req.body;

  const task = await Task.findById(req.params.id).populate('project');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const previousStatus = task.status;
  task.status = status;
  if (order !== undefined) task.order = order;

  if (status === 'done' && previousStatus !== 'done') {
    task.completedAt = new Date();
  } else if (status !== 'done') {
    task.completedAt = null;
  }

  const updated = await task.save();

  await logActivity({
    taskId: task._id,
    projectId: task.project._id || task.project,
    userId: req.user._id,
    action: 'changed status',
    details: `Status changed from "${previousStatus}" to "${status}"`,
  });

  // Notify project owner when task is completed
  if (status === 'done' && previousStatus !== 'done') {
    const project = await Project.findById(task.project._id || task.project);
    if (project && project.owner.toString() !== req.user._id.toString()) {
      await createNotification({
        userId: project.owner,
        message: `Task "${task.title}" has been marked as done`,
        type: 'task_completed',
        link: `/projects/${project._id}`,
      });
    }
  }

  res.json(updated);
});

// @desc    Upload a file attachment to a task
// @route   POST /api/tasks/:id/attachments
// @access  Private
const uploadAttachment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const attachment = {
    filename: req.file.originalname || req.file.filename,
    url: req.file.path,
    publicId: req.file.filename,
    uploadedAt: new Date(),
  };

  task.attachments.push(attachment);
  await task.save();

  await logActivity({
    taskId: task._id,
    projectId: task.project,
    userId: req.user._id,
    action: 'uploaded attachment',
    details: `File "${attachment.filename}" was attached`,
  });

  res.status(201).json(task.attachments[task.attachments.length - 1]);
});

// @desc    Get activity log for a task
// @route   GET /api/tasks/:id/activity
// @access  Private
const getTaskActivity = asyncHandler(async (req, res) => {
  const activities = await ActivityLog.find({ task: req.params.id })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 });

  res.json(activities);
});

module.exports = {
  getProjectTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  uploadAttachment,
  getTaskActivity,
};
