const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

/**
 * Middleware factory: require the requesting user to hold one of the
 * specified roles inside the project (or be the owner).
 * @param {...string} roles - Roles allowed (e.g. 'admin', 'manager')
 */
const requireProjectRole = (...roles) =>
  asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Owner always has full access
    if (project.owner.toString() === req.user._id.toString()) {
      req.project = project;
      return next();
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || !roles.includes(member.role)) {
      res.status(403);
      throw new Error('Forbidden: insufficient project role');
    }

    req.project = project;
    next();
  });

module.exports = { requireProjectRole };
