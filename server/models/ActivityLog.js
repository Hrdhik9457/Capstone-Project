const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
