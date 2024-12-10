const Medal = require('../models/medal');
const Performance = require('../models/performance');
const emailService = require('./email');
const notificationService = require('./notification');

class MedalDetector {
  // 检查所有可能的勋章
  async checkAllMedals(userId, performance) {
    try {
      await Promise.all([
        this.checkProgressMedals(userId, performance),
        this.checkStandardMedals(userId, performance),
        this.checkConsistencyMedals(userId),
        this.checkSpecialAchievements(userId, performance)
      ]);
    } catch (error) {
      console.error('Error checking medals:', error);
    }
  }

  // 检查进步勋章
  async checkProgressMedals(userId, performance) {
    try {
      const previousBest = await Performance.findOne({
        user: userId,
        event: performance.event,
        date: { $lt: performance.date }
      }).sort({ time: 1 });

      if (!previousBest) return;

      const improvement = previousBest.time - performance.time;
      const medals = [];

      if (improvement >= 10) medals.push('PROGRESS_10SEC');
      else if (improvement >= 5) medals.push('PROGRESS_5SEC');
      else if (improvement >= 3) medals.push('PROGRESS_3SEC');

      for (const medalType of medals) {
        await this.awardMedal(userId, {
          type: medalType,
          event: performance.event,
          performance: performance._id
        });
      }
    } catch (error) {
      console.error('Error checking progress medals:', error);
    }
  }

  // 检查标准时间勋章
  async checkStandardMedals(userId, performance) {
    try {
      const standards = await this.getStandardTimes(performance.event);
      const medals = [];

      for (const [level, time] of Object.entries(standards)) {
        if (performance.time <= time) {
          medals.push(`${level}_STANDARD`);
        }
      }

      for (const medalType of medals) {
        await this.awardMedal(userId, {
          type: medalType,
          event: performance.event,
          performance: performance._id
        });
      }
    } catch (error) {
      console.error('Error checking standard medals:', error);
    }
  }

  // 检查连续性勋章
  async checkConsistencyMedals(userId) {
    try {
      const trainings = await Training.find({
        user: userId,
        date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
      }).sort({ date: 1 });

      let maxConsecutiveDays = 0;
      let currentStreak = 0;
      let lastDate = null;

      for (const training of trainings) {
        if (!lastDate || this.isConsecutiveDay(lastDate, training.date)) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        lastDate = training.date;
        maxConsecutiveDays = Math.max(maxConsecutiveDays, currentStreak);
      }

      if (maxConsecutiveDays >= 30) {
        await this.awardMedal(userId, {
          type: 'TRAINING_30DAYS'
        });
      }
      if (maxConsecutiveDays >= 60) {
        await this.awardMedal(userId, {
          type: 'TRAINING_60DAYS'
        });
      }
    } catch (error) {
      console.error('Error checking consistency medals:', error);
    }
  }

  // 颁发勋章
  async awardMedal(userId, medalData) {
    try {
      const existingMedal = await Medal.findOne({
        user: userId,
        type: medalData.type,
        event: medalData.event
      });

      if (!existingMedal) {
        const medal = new Medal({
          user: userId,
          ...medalData,
          earnedDate: new Date()
        });
        await medal.save();

        // 发送通知
        const user = await User.findById(userId);
        await Promise.all([
          emailService.sendMedalNotification(user, medal),
          notificationService.sendNotification(userId, {
            type: 'medal_earned',
            content: `You've earned a new medal: ${medal.name}!`,
            data: medal
          })
        ]);
      }
    } catch (error) {
      console.error('Error awarding medal:', error);
    }
  }

  // 辅助方法：检查是否是连续的天数
  isConsecutiveDay(date1, date2) {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }
}

module.exports = new MedalDetector(); 