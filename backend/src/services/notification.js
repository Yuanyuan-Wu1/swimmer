const nodemailer = require('nodemailer');
const Competition = require('../models/competition');
const User = require('../models/user');
const cron = require('node-cron');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Schedule competition reminders
    this.scheduleCompetitionReminders();
  }

  async scheduleCompetitionReminders() {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      try {
        // Get competitions in the next 7 days
        const upcomingCompetitions = await Competition.find({
          date: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }).populate('registeredAthletes');

        for (const competition of upcomingCompetitions) {
          // Send reminders to registered athletes
          for (const athlete of competition.registeredAthletes) {
            await this.sendCompetitionReminder(athlete, competition);
          }
        }
      } catch (error) {
        console.error('Error scheduling competition reminders:', error);
      }
    });
  }

  async sendCompetitionReminder(user, competition) {
    const daysUntilCompetition = Math.ceil(
      (competition.date - new Date()) / (1000 * 60 * 60 * 24)
    );

    const emailContent = `
      <h2>Competition Reminder</h2>
      <p>Hello ${user.name},</p>
      <p>This is a reminder for your upcoming competition:</p>
      <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
        <h3>${competition.name}</h3>
        <p><strong>Date:</strong> ${competition.date.toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${competition.location}</p>
        <p><strong>Time until competition:</strong> ${daysUntilCompetition} days</p>
        <p><strong>Events:</strong></p>
        <ul>
          ${competition.events.map(event => `<li>${event}</li>`).join('')}
        </ul>
      </div>
      <p>Don't forget to:</p>
      <ul>
        <li>Check your equipment</li>
        <li>Review the competition schedule</li>
        <li>Get enough rest</li>
        <li>Stay hydrated</li>
      </ul>
      <p>Good luck!</p>
    `;

    await this.sendEmail(
      user.email,
      `Competition Reminder: ${competition.name}`,
      emailContent
    );
  }

  async sendRegistrationConfirmation(user, competition) {
    const emailContent = `
      <h2>Registration Confirmation</h2>
      <p>Hello ${user.name},</p>
      <p>Your registration for the following competition has been confirmed:</p>
      <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
        <h3>${competition.name}</h3>
        <p><strong>Date:</strong> ${competition.date.toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${competition.location}</p>
        <p><strong>Events:</strong></p>
        <ul>
          ${competition.events.map(event => `<li>${event}</li>`).join('')}
        </ul>
      </div>
      <p>Important Information:</p>
      <ul>
        <li>Please arrive at least 30 minutes before your first event</li>
        <li>Bring your competition ID and necessary equipment</li>
        <li>Review the competition rules and guidelines</li>
      </ul>
      <p>Good luck with your preparation!</p>
    `;

    await this.sendEmail(
      user.email,
      `Registration Confirmed: ${competition.name}`,
      emailContent
    );
  }

  async sendRegistrationUpdate(user, competition, status) {
    const emailContent = `
      <h2>Registration Status Update</h2>
      <p>Hello ${user.name},</p>
      <p>Your registration status for ${competition.name} has been updated to: <strong>${status}</strong></p>
      <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
        <h3>${competition.name}</h3>
        <p><strong>Date:</strong> ${competition.date.toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${competition.location}</p>
      </div>
      ${status === 'approved' ? `
        <p>Next steps:</p>
        <ul>
          <li>Review the competition schedule</li>
          <li>Prepare your equipment</li>
          <li>Start your preparation routine</li>
        </ul>
      ` : ''}
      <p>If you have any questions, please contact the competition organizers.</p>
    `;

    await this.sendEmail(
      user.email,
      `Registration Update: ${competition.name}`,
      emailContent
    );
  }

  async sendEmail(to, subject, htmlContent) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html: htmlContent
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
