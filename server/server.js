require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const emailService = require('./services/emailService');
const Task = require('./models/Task');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// Error Handler (must be last)
app.use(errorHandler);

// --- Cron Job: Daily Deadline Reminders at 8:00 AM ---
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Running deadline reminder job...');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);

    const dueTasks = await Task.find({
      dueDate: { $gte: startOfTomorrow, $lte: endOfTomorrow },
      status: { $ne: 'done' },
    }).populate('assignee', 'name email');

    for (const task of dueTasks) {
      if (task.assignee && task.assignee.email) {
        await emailService.sendDeadlineReminder(task.assignee, task);
        console.log(`[CRON] Sent reminder for task "${task.title}" to ${task.assignee.email}`);
      }
    }

    console.log(`[CRON] Processed ${dueTasks.length} deadline reminders.`);
  } catch (err) {
    console.error('[CRON] Deadline reminder job failed:', err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
