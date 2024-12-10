const HealthData = require('../models/healthData');
const Performance = require('../models/performance');

class HealthAnalysisService {
  // 记录健康数据
  async recordHealthData(userId, data) {
    try {
      const healthData = new HealthData({
        user: userId,
        ...data,
        date: new Date()
      });
      await healthData.save();
      return healthData;
    } catch (error) {
      throw error;
    }
  }

  // 分析健康趋势
  async analyzeHealthTrends(userId, startDate, endDate) {
    try {
      const healthData = await HealthData.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      const trends = {
        fatigue: this.calculateTrend(healthData.map(d => d.fatigue)),
        sleep: this.calculateTrend(healthData.map(d => d.sleepHours)),
        nutrition: this.calculateTrend(healthData.map(d => d.nutritionScore)),
        hydration: this.calculateTrend(healthData.map(d => d.hydrationLevel))
      };

      return trends;
    } catch (error) {
      throw error;
    }
  }

  // 计算健康指标与表现的相关性
  async analyzePerformanceCorrelation(userId, startDate, endDate) {
    try {
      const healthData = await HealthData.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate }
      });

      const performances = await Performance.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate }
      });

      // 计算相关性
      const correlation = {
        sleep: this.calculateCorrelation(
          healthData.map(d => d.sleepHours),
          performances.map(p => p.time)
        ),
        nutrition: this.calculateCorrelation(
          healthData.map(d => d.nutritionScore),
          performances.map(p => p.time)
        )
      };

      return correlation;
    } catch (error) {
      throw error;
    }
  }

  // 生成健康建议
  async generateHealthRecommendations(userId) {
    try {
      const recentHealth = await HealthData.findOne({ user: userId })
        .sort({ date: -1 });

      const recommendations = [];

      if (recentHealth.sleepHours < 7) {
        recommendations.push({
          type: 'sleep',
          message: 'Consider increasing sleep duration to improve recovery'
        });
      }

      if (recentHealth.hydrationLevel < 8) {
        recommendations.push({
          type: 'hydration',
          message: 'Increase water intake to maintain optimal hydration'
        });
      }

      return recommendations;
    } catch (error) {
      throw error;
    }
  }

  // 辅助方法：计算趋势
  calculateTrend(data) {
    const n = data.length;
    if (n < 2) return 0;

    const xMean = (n - 1) / 2;
    const yMean = data.reduce((a, b) => a + b) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (data[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    return numerator / denominator;
  }

  // 辅助方法：计算相关性
  calculateCorrelation(x, y) {
    const n = x.length;
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_x2 = 0;
    let sum_y2 = 0;

    for (let i = 0; i < n; i++) {
      sum_x += x[i];
      sum_y += y[i];
      sum_xy += x[i] * y[i];
      sum_x2 += x[i] * x[i];
      sum_y2 += y[i] * y[i];
    }

    return (n * sum_xy - sum_x * sum_y) / 
      Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));
  }
}

module.exports = new HealthAnalysisService(); 