/**
 * 健康提醒服务
 * 管理用户的健康提醒和通知
 */
class HealthReminderService {
  /**
   * 创建新提醒
   * @param {string} userId - 用户ID
   * @param {Object} reminderData - 提醒数据
   */
  async createReminder(userId, reminderData) {
    try {
      const reminder = new HealthReminder({
        user: userId,
        ...reminderData
      });
      await reminder.save();

      // 设置定时任务
      await this._scheduleReminder(reminder);

      return reminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  /**
   * 发送提醒通知
   * @param {HealthReminder} reminder - 提醒对象
   */
  async sendReminder(reminder) {
    try {
      const user = await User.findById(reminder.user);
      
      // 发送通知
      await notificationService.send({
        userId: user._id,
        title: reminder.title,
        body: reminder.content,
        type: 'health_reminder',
        data: {
          reminderId: reminder._id,
          type: reminder.type
        }
      });

      // 更新提醒状态
      reminder.lastTriggered = new Date();
      await reminder.save();
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }

  // ... 其他方法
} 