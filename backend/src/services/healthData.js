const mongoose = require('mongoose');
const axios = require('axios');

class HealthDataService {
  /**
   * Store health data from various sources
   * @param {string} userId - User ID
   * @param {Object} data - Health data object
   * @returns {Object} Stored health data
   */
  async storeHealthData(userId, data) {
    try {
      const healthData = new HealthData({
        userId,
        timestamp: new Date(),
        metrics: {
          heartRate: data.heartRate,
          bloodPressure: data.bloodPressure,
          sleep: data.sleep,
          nutrition: data.nutrition,
          weight: data.weight,
          bodyFat: data.bodyFat,
          hydration: data.hydration,
          recovery: data.recovery,
          stress: data.stress,
          vo2max: data.vo2max
        },
        source: data.source
      });

      await healthData.save();
      return healthData;
    } catch (error) {
      console.error('Error storing health data:', error);
      throw error;
    }
  }

  /**
   * Get health data trends
   * @param {string} userId - User ID
   * @param {string} metric - Metric to analyze
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} Trend analysis
   */
  async getHealthTrends(userId, metric, startDate, endDate) {
    try {
      const data = await HealthData.find({
        userId,
        timestamp: { $gte: startDate, $lte: endDate }
      }).sort('timestamp');

      const values = data.map(d => d.metrics[metric]);
      
      return {
        metric,
        period: { startDate, endDate },
        stats: {
          min: Math.min(...values),
          max: Math.max(...values),
          average: values.reduce((a, b) => a + b, 0) / values.length,
          trend: this.calculateTrend(values)
        },
        correlation: await this.correlateWithPerformance(userId, metric, data)
      };
    } catch (error) {
      console.error('Error getting health trends:', error);
      throw error;
    }
  }

  /**
   * Calculate trend direction and magnitude
   * @param {Array} values - Array of numeric values
   * @returns {Object} Trend information
   */
  calculateTrend(values) {
    const n = values.length;
    if (n < 2) return { direction: 'neutral', magnitude: 0 };

    // Simple linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    return {
      direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'neutral',
      magnitude: Math.abs(slope)
    };
  }

  /**
   * Correlate health metrics with performance
   * @param {string} userId - User ID
   * @param {string} metric - Health metric
   * @param {Array} healthData - Health data array
   * @returns {Object} Correlation analysis
   */
  async correlateWithPerformance(userId, metric, healthData) {
    try {
      const performances = await Performance.find({
        athlete: userId,
        date: {
          $gte: healthData[0].timestamp,
          $lte: healthData[healthData.length - 1].timestamp
        }
      }).sort('date');

      // Match health data with nearest performance
      const pairs = [];
      for (const perf of performances) {
        const nearestHealth = this.findNearestHealthData(perf.date, healthData);
        if (nearestHealth) {
          pairs.push({
            health: nearestHealth.metrics[metric],
            performance: perf.finaPoints
          });
        }
      }

      // Calculate correlation coefficient
      return this.calculateCorrelation(
        pairs.map(p => p.health),
        pairs.map(p => p.performance)
      );
    } catch (error) {
      console.error('Error correlating with performance:', error);
      return null;
    }
  }

  /**
   * Find nearest health data point to a date
   * @param {Date} date - Target date
   * @param {Array} healthData - Health data array
   * @returns {Object} Nearest health data point
   */
  findNearestHealthData(date, healthData) {
    return healthData.reduce((nearest, current) => {
      const currentDiff = Math.abs(current.timestamp - date);
      const nearestDiff = nearest ? Math.abs(nearest.timestamp - date) : Infinity;
      return currentDiff < nearestDiff ? current : nearest;
    }, null);
  }

  /**
   * Calculate correlation coefficient
   * @param {Array} x - First array of values
   * @param {Array} y - Second array of values
   * @returns {Object} Correlation information
   */
  calculateCorrelation(x, y) {
    const n = x.length;
    if (n !== y.length || n < 2) return null;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const r = (n * sumXY - sumX * sumY) /
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return {
      coefficient: r,
      strength: Math.abs(r),
      direction: r > 0 ? 'positive' : r < 0 ? 'negative' : 'neutral',
      description: this.describeCorrelation(r)
    };
  }

  /**
   * Get descriptive text for correlation coefficient
   * @param {number} r - Correlation coefficient
   * @returns {string} Correlation description
   */
  describeCorrelation(r) {
    const abs = Math.abs(r);
    if (abs >= 0.7) return 'Strong correlation';
    if (abs >= 0.5) return 'Moderate correlation';
    if (abs >= 0.3) return 'Weak correlation';
    return 'No significant correlation';
  }

  /**
   * Integrate with Apple Health
   * @param {string} userId - User ID
   * @param {Object} authData - Apple Health authentication data
   * @returns {Object} Integration status
   */
  async integrateAppleHealth(userId, authData) {
    // Implementation depends on Apple Health API
    throw new Error('Apple Health integration not implemented');
  }

  /**
   * Integrate with Garmin Connect
   * @param {string} userId - User ID
   * @param {Object} credentials - Garmin Connect credentials
   * @returns {Object} Integration status
   */
  async integrateGarmin(userId, credentials) {
    // Implementation depends on Garmin Connect API
    throw new Error('Garmin integration not implemented');
  }

  /**
   * Integrate with Fitbit
   * @param {string} userId - User ID
   * @param {Object} token - Fitbit OAuth token
   * @returns {Object} Integration status
   */
  async integrateFitbit(userId, token) {
    try {
      const response = await axios.get('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const healthData = {
        heartRate: response.data['activities-heart'][0].value.restingHeartRate,
        source: 'Fitbit'
      };

      return await this.storeHealthData(userId, healthData);
    } catch (error) {
      console.error('Error integrating with Fitbit:', error);
      throw error;
    }
  }
}

module.exports = new HealthDataService();
