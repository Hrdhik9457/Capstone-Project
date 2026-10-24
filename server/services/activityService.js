const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

/**
 * Log an activity entry.
 * @param {{ taskId?: string, projectId: string, userId: string, action: string, details?: string }} params
 */
const logActivity = async ({ taskId, projectId, userId, action, details = '' }) => {
  try {
    await ActivityLog.create({
      task: taskId || null,
      project: projectId,
      user: userId,
      action,
      details,
    });
  } catch (err) {
    console.error('[ActivityService] Failed to log activity:', err.message);
  }
};

/**
 * Create an in-app notification for a user.
 * @param {{ userId: string, message: string, type: string, link?: string }} params
 */
const createNotification = async ({ userId, message, type, link = '' }) => {
  try {
    await Notification.create({ user: userId, message, type, link });
  } catch (err) {
    console.error('[ActivityService] Failed to create notification:', err.message);
  }
};

module.exports = { logActivity, createNotification };
