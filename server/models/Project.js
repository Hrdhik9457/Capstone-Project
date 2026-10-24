const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Project title is required'], trim: true },
    description: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [memberSchema],
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    deadline: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
