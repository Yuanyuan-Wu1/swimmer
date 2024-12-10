const Performance = require('../models/performance');
const standardsService = require('./standardsService');

/**
 * 成绩管理服务
 * 处理游泳成绩的添加、查询和分析等功能
 */
class PerformanceService {
  /**
   * 添加新的成绩记录
   * @param {string} userId - 用户ID
   * @param {Object} data - 成绩数据
   * @param {string} data.event - 比赛项目(如: "50_FR_SCY")
   * @param {string} data.time - 成绩时间(格式: "MM:SS.ms")
   * @param {Date} data.date - 比赛日期
   * @param {string} [data.competition] - 关联的比赛ID
   * @returns {Promise<Performance>} 创建的成绩记录
   * @throws {Error} 当保存失败时抛出错误
   */
  async addPerformance(userId, data) {
    try {
      const user = await User.findById(userId);
      
      // 创建性能记录
      const performance = new Performance({
        user: userId,
        ...data,
        time: {
          value: this._convertToMs(data.time),
          displayValue: data.time
        }
      });

      // 检查达标情况
      const standards = await standardsService.checkPerformanceStandards(
        performance,
        user.profile.age
      );
      
      if (standards) {
        performance.standardsAchieved = standards;
      }

      // 添加重试逻辑
      let retries = 3;
      while (retries > 0) {
        try {
          await performance.save();
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return performance;
    } catch (error) {
      console.error('Error saving performance:', error);
      throw error;
    }
  }

  /**
   * 获取用户的成绩记录
   * @param {string} userId - 用户ID
   * @param {Object} filters - 过滤条件
   * @param {string} [filters.event] - 比赛项目
   * @param {string} [filters.timeRange] - 时间范围('1y'|'6m'|'3m')
   * @returns {Promise<Array<Performance>>} 成绩记录列表
   */
  async getPerformances(userId, filters) {
    try {
      const query = { user: userId };
      
      if (filters.event) {
        query.event = filters.event;
      }
      
      if (filters.timeRange) {
        const date = new Date();
        date.setMonth(date.getMonth() - this._getMonthsFromRange(filters.timeRange));
        query.date = { $gte: date };
      }

      const performances = await Performance.find(query)
        .sort({ date: -1 })
        .lean();

      return performances;
    } catch (error) {
      console.error('Error getting performances:', error);
      throw error;
    }
  }

  /**
   * 将时间范围转换为月数
   * @private
   * @param {string} range - 时间范围标识
   * @returns {number} 月数
   */
  _getMonthsFromRange(range) {
    switch (range) {
      case '1y': return 12;
      case '6m': return 6;
      case '3m': return 3;
      default: return 12;
    }
  }

  /**
   * 将时间字符串转换为毫秒数
   * @private
   * @param {string} timeStr - 时间字符串(格式: "MM:SS.ms")
   * @returns {number} 毫秒数
   */
  _convertToMs(timeStr) {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return (minutes * 60 + seconds) * 1000;
  }
}

module.exports = new PerformanceService(); 