const Medal = require('../models/medal');
const Performance = require('../models/performance');
const { sendNotification } = require('./notification');

class MedalService {
  // 检查和颁发勋章
  async checkAndAwardMedals(userId, performance) {
    try {
      // 检查进步勋章
      await this.checkProgressMedals(userId, performance);
      // 检查标准时间勋章
      await this.checkStandardMedals(userId, performance);
      // 检查特殊成就勋章
      await this.checkSpecialMedals(userId, performance);
    } catch (error) {
      throw error;
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
      let medalType = null;

      if (improvement >= 10) medalType = 'PROGRESS_10SEC';
      else if (improvement >= 5) medalType = 'PROGRESS_5SEC';
      else if (improvement >= 3) medalType = 'PROGRESS_3SEC';

      if (medalType) {
        await this.awardMedal(userId, {
          type: medalType,
          event: performance.event,
          performance: performance._id
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // 检查标准时间勋章
  async checkStandardMedals(userId, performance) {
    try {
      const standards = Standards.USA_SWIMMING[performance.event];
      if (!standards) return;

      for (const [level, time] of Object.entries(standards)) {
        if (performance.time <= time) {
          await this.awardMedal(userId, {
            type: `${level}_STANDARD`,
            event: performance.event,
            performance: performance._id
          });
        }
      }
    } catch (error) {
      throw error;
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

        // 发送勋章通知
        await sendNotification(userId, {
          type: 'medal_earned',
          medal: medal
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // 获取用户勋章统计
  async getMedalStats(userId) {
    try {
      const stats = await Medal.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            medals: { $push: '$$ROOT' }
          }
        }
      ]);

      return stats;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MedalService(); 