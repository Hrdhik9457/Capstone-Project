const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { logActivity, createNotification } = require('../services/activityService');

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 });

  res.json(projects);
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const { title, description, deadline } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Project title is required');
  }

  const project = await Project.create({
    title,
    description,
    deadline: deadline || null,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'admin' }],
  });

  await logActivity({
    projectId: project._id,
    userId: req.user._id,
    action: 'created project',
    details: `Project "${title}" was created`,
  });

  const populated = await project.populate([
    { path: 'owner', select: 'name email avatar' },
    { path: 'members.user', select: 'name email avatar' },
  ]);

  res.status(201).json(populated);
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isMember =
    project.owner._id.toString() === req.user._id.toString() ||
    project.members.some((m) => m.user._id.toString() === req.user._id.toString());

  if (!isMember) {
    res.status(403);
    throw new Error('Access denied: you are not a member of this project');
  }

  res.json(project);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (owner only)
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the project owner can update this project');
  }

  const { title, description, deadline, status } = req.body;
  if (title) project.title = title;
  if (description !== undefined) project.description = description;
  if (deadline !== undefined) project.deadline = deadline;
  if (status) project.status = status;

  const updated = await project.save();

  await logActivity({
    projectId: project._id,
    userId: req.user._id,
    action: 'updated project',
    details: `Project "${updated.title}" was updated`,
  });

  res.json(updated);
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (owner only)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the project owner can delete this project');
  }

  // Cascade delete tasks and activity logs
  await Task.deleteMany({ project: project._id });
  await ActivityLog.deleteMany({ project: project._id });
  await project.deleteOne();

  res.json({ message: 'Project and all associated data deleted successfully' });
});

// @desc    Add a member to a project by email
// @route   POST /api/projects/:id/members
// @access  Private
const addMember = asyncHandler(async (req, res) => {
  const { email, role = 'member' } = req.body;

  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Only owner or admin can add members
  const isOwner = project.owner.toString() === req.user._id.toString();
  const isAdmin = project.members.some(
    (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
  );

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Only the owner or an admin can add members');
  }

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    res.status(404);
    throw new Error('No user found with that email address');
  }

  const alreadyMember = project.members.some(
    (m) => m.user.toString() === userToAdd._id.toString()
  );
  if (alreadyMember || project.owner.toString() === userToAdd._id.toString()) {
    res.status(400);
    throw new Error('User is already a member of this project');
  }

  project.members.push({ user: userToAdd._id, role });
  await project.save();

  await logActivity({
    projectId: project._id,
    userId: req.user._id,
    action: 'added member',
    details: `${userToAdd.name} was added as ${role}`,
  });

  await createNotification({
    userId: userToAdd._id,
    message: `You have been added to project "${project.title}" as ${role}`,
    type: 'member_added',
    link: `/projects/${project._id}`,
  });

  const updated = await Project.findById(project._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.json(updated);
});

// @desc    Remove a member from a project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (owner or admin)
const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isOwner = project.owner.toString() === req.user._id.toString();
  const isAdmin = project.members.some(
    (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
  );

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Only the owner or an admin can remove members');
  }

  project.members = project.members.filter(
    (m) => m.user.toString() !== req.params.userId
  );
  await project.save();

  await logActivity({
    projectId: project._id,
    userId: req.user._id,
    action: 'removed member',
    details: `Member with ID ${req.params.userId} was removed`,
  });

  res.json({ message: 'Member removed successfully' });
});

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
