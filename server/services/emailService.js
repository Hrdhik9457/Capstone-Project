const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a deadline reminder email to the task assignee.
 * @param {{ name: string, email: string }} user
 * @param {{ title: string, _id: string }} task
 */
const sendDeadlineReminder = async (user, task) => {
  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `⏰ Reminder: Task "${task.title}" is due tomorrow`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #6366f1;">TaskFlow — Deadline Reminder</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>This is a friendly reminder that the following task is due <strong>tomorrow</strong>:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <h3 style="margin: 0; color: #111827;">${task.title}</h3>
          ${task.description ? `<p style="color: #6b7280; margin: 8px 0 0;">${task.description}</p>` : ''}
        </div>
        <p>Please make sure to complete it on time!</p>
        <a href="${process.env.CLIENT_URL}/projects/${task.project}" style="
          display: inline-block; background: #6366f1; color: white; padding: 10px 20px;
          border-radius: 6px; text-decoration: none; margin-top: 8px;">
          View Task
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">You are receiving this because you are assigned to this task on TaskFlow.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send a welcome email to a newly registered user.
 * @param {{ name: string, email: string }} user
 */
const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Welcome to TaskFlow, ${user.name}! 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #6366f1;">Welcome to TaskFlow! 🚀</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>We're thrilled to have you on board. TaskFlow helps you and your team manage projects and tasks efficiently.</p>
        <h3 style="color: #374151;">Here's what you can do:</h3>
        <ul style="color: #4b5563; line-height: 1.8;">
          <li>📁 Create and manage projects</li>
          <li>✅ Track tasks with a Kanban board</li>
          <li>👥 Collaborate with your team</li>
          <li>📊 View analytics and progress dashboards</li>
        </ul>
        <a href="${process.env.CLIENT_URL}/dashboard" style="
          display: inline-block; background: #6366f1; color: white; padding: 10px 20px;
          border-radius: 6px; text-decoration: none; margin-top: 16px;">
          Go to Dashboard
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">If you didn't create this account, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendDeadlineReminder, sendWelcomeEmail };
