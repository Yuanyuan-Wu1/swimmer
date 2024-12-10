const axios = require('axios');
const config = require('../config/integration');
const User = require('../models/user');
const Performance = require('../models/performance');
const HealthData = require('../models/healthData');

/**
 * 第三方平台集成服务
 * 处理与外部平台的数据交互
 */
class IntegrationService {
  /**
   * 同步West Team数据
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} 同步的数据
   * @throws {Error} 同步失败时抛出错误
   */
  async syncWestTeam(userId) {
    try {
      const user = await User.findById(userId);
      if (!user.integrations?.westTeam?.id) {
        throw new Error('West Team ID not found');
      }

      // 获取比赛成绩
      const results = await axios.get(
        `${config.westTeam.baseUrl}${config.westTeam.endpoints.meetResults}`,
        {
          params: { swimmerId: user.integrations.westTeam.id }
        }
      );

      // 处理并保存数据
      for (const result of results.data) {
        await Performance.findOneAndUpdate(
          {
            user: userId,
            source: 'westteam',
            sourceId: result.id
          },
          {
            event: result.event,
            time: {
              value: this.convertToMs(result.time),
              displayValue: result.time
            },
            date: result.date,
            competition: result.meet
          },
          { upsert: true }
        );
      }

      return results.data;
    } catch (error) {
      console.error('West Team sync error:', error);
      throw error;
    }
  }

  /**
   * 同步SwimCloud数据
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} 同步的数据
   */
  async syncSwimCloud(userId) {
    try {
      const user = await User.findById(userId);
      if (!user.integrations?.swimCloud?.id) {
        throw new Error('SwimCloud ID not found');
      }

      // 获取游泳成绩
      const times = await axios.get(
        `${config.swimCloud.baseUrl}${config.swimCloud.endpoints.times}`,
        {
          params: { swimmerId: user.integrations.swimCloud.id }
        }
      );

      // 处理并保存数据
      for (const time of times.data) {
        await Performance.findOneAndUpdate(
          {
            user: userId,
            source: 'swimcloud',
            sourceId: time.id
          },
          {
            event: time.event,
            time: {
              value: this.convertToMs(time.time),
              displayValue: time.time
            },
            date: time.date,
            competition: time.meet
          },
          { upsert: true }
        );
      }

      return times.data;
    } catch (error) {
      console.error('SwimCloud sync error:', error);
      throw error;
    }
  }

  /**
   * 同步Garmin健康数据
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} 同步的活动数据
   */
  async syncGarmin(userId) {
    try {
      const user = await User.findById(userId);
      if (!user.integrations?.garmin?.token) {
        throw new Error('Garmin token not found');
      }

      // 获取活动数据
      const activities = await axios.get(
        `${config.garmin.baseUrl}${config.garmin.endpoints.activities}`,
        {
          headers: {
            Authorization: `Bearer ${user.integrations.garmin.token}`
          }
        }
      );

      // 保存健康数据
      for (const activity of activities.data) {
        if (activity.type === 'SWIMMING') {
          await HealthData.findOneAndUpdate(
            {
              user: userId,
              source: 'garmin',
              sourceId: activity.id
            },
            {
              type: 'activity',
              data: {
                distance: activity.distance,
                duration: activity.duration,
                calories: activity.calories,
                heartRate: activity.averageHeartRate,
                laps: activity.laps
              },
              date: activity.startTime
            },
            { upsert: true }
          );
        }
      }

      return activities.data;
    } catch (error) {
      console.error('Garmin sync error:', error);
      throw error;
    }
  }

  // Apple Health 数据同步
  async syncAppleHealth(userId, healthData) {
    try {
      // 处理从iOS应用发送的健康数据
      for (const record of healthData) {
        await HealthData.findOneAndUpdate(
          {
            user: userId,
            source: 'apple_health',
            sourceId: record.id
          },
          {
            type: record.type,
            data: record.data,
            date: record.date
          },
          { upsert: true }
        );
      }

      return healthData;
    } catch (error) {
      console.error('Apple Health sync error:', error);
      throw error;
    }
  }

  // 工具方法
  convertToMs(timeStr) {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return (minutes * 60 + seconds) * 1000;
  }
}

module.exports = new IntegrationService(); 