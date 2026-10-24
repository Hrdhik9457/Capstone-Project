const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: { type: String },
  url: { type: String },
  publicId: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Task title is required'], trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['todo', 'inprogress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    dueDate: { type: Date, default: null },
    attachments: [attachmentSchema],
    order: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
