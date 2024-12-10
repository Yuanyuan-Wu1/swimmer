const axios = require('axios');
const Performance = require('../models/performance');
const Competition = require('../models/competition');
const mongoose = require('mongoose');

/**
 * 数据同步服务
 * 负责与外部系统的数据同步
 */
class SyncService {
  constructor() {
    /** @private API配置 */
    this.apis = {
      usaSwimming: {
        baseUrl: process.env.USA_SWIMMING_API_URL,
        apiKey: process.env.USA_SWIMMING_API_KEY
      },
      meetMobile: {
        baseUrl: process.env.MEET_MOBILE_API_URL,
        apiKey: process.env.MEET_MOBILE_API_KEY
      }
    };
    /** @private MongoDB会话 */
    this.session = null;
  }

  /**
   * 同步比赛成绩
   * @param {string} userId - 用户ID
   * @param {string} competitionId - 比赛ID
   * @returns {Promise<boolean>} 同步是否成功
   */
  async syncCompetitionResults(userId, competitionId) {
    try {
      const competition = await Competition.findById(competitionId);
      const results = await this.fetchExternalResults(competition);

      for (const result of results) {
        await Performance.findOneAndUpdate(
          {
            user: userId,
            competition: competitionId,
            event: result.event
          },
          {
            time: result.time,
            splits: result.splits,
            place: result.place
          },
          { upsert: true }
        );
      }

      return true;
    } catch (error) {
      console.error('Error syncing competition results:', error);
      return false;
    }
  }

  /**
   * 从外部API获取成绩数据
   * @private
   * @param {Competition} competition - 比赛信息
   * @returns {Promise<Array>} 成绩数据
   */
  async fetchExternalResults(competition) {
    try {
      const response = await axios.get(
        `${this.apis.meetMobile.baseUrl}/results/${competition.externalId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apis.meetMobile.apiKey}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching external results:', error);
      throw error;
    }
  }

  // 同步USA Swimming数据
  async syncUSASwimmingData(userId, usaSwimmingId) {
    try {
      const response = await axios.get(
        `${this.apis.usaSwimming.baseUrl}/swimmers/${usaSwimmingId}/times`,
        {
          headers: {
            'Authorization': `Bearer ${this.apis.usaSwimming.apiKey}`
          }
        }
      );

      const times = response.data;
      for (const time of times) {
        await Performance.findOneAndUpdate(
          {
            user: userId,
            externalId: time.id
          },
          {
            event: time.event,
            time: time.time,
            date: time.date,
            competition: time.meetId
          },
          { upsert: true }
        );
      }

      return true;
    } catch (error) {
      console.error('Error syncing USA Swimming data:', error);
      return false;
    }
  }

  // 定期同步数据
  async scheduleSyncJobs() {
    // 每天凌晨同步数据
    setInterval(async () => {
      const users = await User.find({ 'profile.usaSwimmingId': { $exists: true } });
      for (const user of users) {
        await this.syncUSASwimmingData(user._id, user.profile.usaSwimmingId);
      }
    }, 24 * 60 * 60 * 1000);
  }

  // 添加事务处理
  async syncData(userId) {
    try {
      this.session = await mongoose.startSession();
      this.session.startTransaction();

      // 同步逻辑...
      
      await this.session.commitTransaction();
    } catch (error) {
      if (this.session) {
        await this.session.abortTransaction();
      }
      throw error;
    } finally {
      if (this.session) {
        this.session.endSession();
      }
    }
  }
}

module.exports = new SyncService(); 