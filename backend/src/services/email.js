const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

class EmailService {
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

    this.templates = {
      medalEarned: path.join(__dirname, '../templates/emails/medal-earned.ejs'),
      competitionReminder: path.join(__dirname, '../templates/emails/competition-reminder.ejs'),
      teamAnnouncement: path.join(__dirname, '../templates/emails/team-announcement.ejs'),
      performanceReport: path.join(__dirname, '../templates/emails/performance-report.ejs')
    };
  }

  async sendEmail(to, { subject, template, data }) {
    try {
      const htmlContent = await ejs.renderFile(this.templates[template], data);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // 发送勋章通知
  async sendMedalNotification(user, medal) {
    await this.sendEmail(user.email, {
      subject: `🏅 New Medal Earned - ${medal.name}`,
      template: 'medalEarned',
      data: { user, medal }
    });
  }

  // 发送比赛提醒
  async sendCompetitionReminder(user, competition) {
    await this.sendEmail(user.email, {
      subject: `🏊‍♂️ Upcoming Competition - ${competition.name}`,
      template: 'competitionReminder',
      data: { user, competition }
    });
  }

  // 发送团队公告
  async sendTeamAnnouncement(users, announcement) {
    for (const user of users) {
      await this.sendEmail(user.email, {
        subject: `📢 Team Announcement - ${announcement.title}`,
        template: 'teamAnnouncement',
        data: { user, announcement }
      });
    }
  }

  // 发送性能报告
  async sendPerformanceReport(user, report) {
    await this.sendEmail(user.email, {
      subject: '📊 Your Weekly Performance Report',
      template: 'performanceReport',
      data: { user, report }
    });
  }
}

module.exports = new EmailService(); 