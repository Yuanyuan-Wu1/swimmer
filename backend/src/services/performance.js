const Performance = require('../models/performance');
const Standards = require('../data/standards');

class PerformanceService {
  // 获取个人最佳成绩
  async getPersonalBests(userId) {
    try {
      const personalBests = await Performance.aggregate([
        { $match: { user: userId } },
        { $sort: { time: 1 } },
        {
          $group: {
            _id: '$event',
            bestTime: { $first: '$time' },
            date: { $first: '$date' },
            competition: { $first: '$competition' }
          }
        }
      ]);
      return personalBests;
    } catch (error) {
      throw error;
    }
  }

  // 分析进步趋势
  async analyzeProgress(userId, event) {
    try {
      const performances = await Performance.find({ 
        user: userId,
        event: event 
      }).sort({ date: 1 });

      let progressData = performances.map((perf, index) => {
        let improvement = 0;
        if (index > 0) {
          improvement = performances[index - 1].time - perf.time;
        }
        return {
          date: perf.date,
          time: perf.time,
          improvement,
          competition: perf.competition
        };
      });

      return progressData;
    } catch (error) {
      throw error;
    }
  }

  // 计算FINA分数
  calculateFinaPoints(time, event, courseType) {
    const baseTime = Standards.FINA_POINTS[courseType][event];
    if (!baseTime) return 0;
    
    return Math.round(1000 * Math.pow(baseTime / time, 3));
  }

  // 与标准时间比较
  async compareWithStandards(userId, event, ageGroup) {
    try {
      const personalBest = await Performance.findOne({ 
        user: userId,
        event: event 
      }).sort({ time: 1 });

      if (!personalBest) return null;

      const standards = Standards.USA_SWIMMING[event][ageGroup];
      let comparison = {};

      Object.entries(standards).forEach(([level, time]) => {
        comparison[level] = {
          standard: time,
          achieved: personalBest.time <= time,
          difference: personalBest.time - time
        };
      });

      return {
        personalBest: personalBest.time,
        standards: comparison
      };
    } catch (error) {
      throw error;
    }
  }

  // 生成性能报告
  async generatePerformanceReport(userId, startDate, endDate) {
    try {
      const performances = await Performance.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      const report = {
        totalPerformances: performances.length,
        personalBests: 0,
        averageImprovement: 0,
        bestEvents: [],
        improvementAreas: []
      };

      // 计算个人最佳次数和平均进步
      let totalImprovement = 0;
      performances.forEach((perf, index) => {
        if (perf.isPersonalBest) report.personalBests++;
        if (index > 0) {
          const improvement = performances[index - 1].time - perf.time;
          totalImprovement += improvement;
        }
      });

      report.averageImprovement = totalImprovement / (performances.length - 1);

      return report;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PerformanceService(); 