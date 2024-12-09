const axios = require('axios');
const HealthData = require('../models/healthData');

class HealthPlatformService {
  constructor() {
    this.platforms = {
      appleHealth: {
        name: 'Apple Health',
        metrics: ['heartRate', 'sleep', 'activity', 'bloodPressure']
      },
      garmin: {
        name: 'Garmin Connect',
        baseUrl: 'https://api.garmin.com/wellness-api/rest',
        metrics: ['heartRate', 'sleep', 'activity', 'stress', 'vo2Max']
      },
      fitbit: {
        name: 'Fitbit',
        baseUrl: 'https://api.fitbit.com/1/user/-',
        metrics: ['heartRate', 'sleep', 'activity', 'nutrition']
      },
      polar: {
        name: 'Polar',
        baseUrl: 'https://www.polaraccesslink.com/v3',
        metrics: ['heartRate', 'sleep', 'activity', 'recovery']
      },
      whoop: {
        name: 'WHOOP',
        baseUrl: 'https://api.whoop.com/v1',
        metrics: ['strain', 'recovery', 'sleep']
      },
      oura: {
        name: 'Oura Ring',
        baseUrl: 'https://api.ouraring.com/v2',
        metrics: ['sleep', 'activity', 'readiness']
      },
      suunto: {
        name: 'Suunto',
        baseUrl: 'https://api.suunto.com/v2',
        metrics: ['heartRate', 'activity', 'training']
      }
    };
  }

  /**
   * Integrate with Apple Health
   * @param {string} userId - User ID
   * @param {Object} authData - Apple Health authentication data
   * @returns {Object} Integration status
   */
  async integrateAppleHealth(userId, authData) {
    try {
      // Apple Health integration requires native iOS app integration
      // This is a placeholder for the actual implementation
      const healthData = {
        heartRate: authData.heartRate,
        sleep: authData.sleep,
        activity: authData.activity,
        bloodPressure: authData.bloodPressure,
        source: 'Apple Health'
      };

      await this.storeHealthData(userId, healthData);
      return { success: true, platform: 'Apple Health' };
    } catch (error) {
      console.error('Error integrating with Apple Health:', error);
      throw error;
    }
  }

  /**
   * Integrate with Garmin Connect
   * @param {string} userId - User ID
   * @param {Object} token - Garmin OAuth token
   * @returns {Object} Integration status
   */
  async integrateGarmin(userId, token) {
    try {
      const endpoints = {
        heartRate: '/heart-rates/latest',
        sleep: '/sleep',
        activity: '/activities/latest',
        stress: '/stress/latest',
        vo2Max: '/vo2-max/latest'
      };

      const data = {};
      for (const [metric, endpoint] of Object.entries(endpoints)) {
        const response = await axios.get(
          `${this.platforms.garmin.baseUrl}${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        data[metric] = response.data;
      }

      await this.storeHealthData(userId, {
        ...data,
        source: 'Garmin Connect'
      });

      return { success: true, platform: 'Garmin Connect' };
    } catch (error) {
      console.error('Error integrating with Garmin:', error);
      throw error;
    }
  }

  /**
   * Integrate with Polar
   * @param {string} userId - User ID
   * @param {Object} token - Polar OAuth token
   * @returns {Object} Integration status
   */
  async integratePolar(userId, token) {
    try {
      const endpoints = {
        heartRate: '/continuous-heart-rate',
        sleep: '/sleep',
        activity: '/activity',
        recovery: '/recovery'
      };

      const data = {};
      for (const [metric, endpoint] of Object.entries(endpoints)) {
        const response = await axios.get(
          `${this.platforms.polar.baseUrl}${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        data[metric] = response.data;
      }

      await this.storeHealthData(userId, {
        ...data,
        source: 'Polar'
      });

      return { success: true, platform: 'Polar' };
    } catch (error) {
      console.error('Error integrating with Polar:', error);
      throw error;
    }
  }

  /**
   * Integrate with WHOOP
   * @param {string} userId - User ID
   * @param {Object} token - WHOOP OAuth token
   * @returns {Object} Integration status
   */
  async integrateWhoop(userId, token) {
    try {
      const endpoints = {
        strain: '/cycles/strain',
        recovery: '/cycles/recovery',
        sleep: '/cycles/sleep'
      };

      const data = {};
      for (const [metric, endpoint] of Object.entries(endpoints)) {
        const response = await axios.get(
          `${this.platforms.whoop.baseUrl}${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        data[metric] = response.data;
      }

      await this.storeHealthData(userId, {
        ...data,
        source: 'WHOOP'
      });

      return { success: true, platform: 'WHOOP' };
    } catch (error) {
      console.error('Error integrating with WHOOP:', error);
      throw error;
    }
  }

  /**
   * Integrate with Oura Ring
   * @param {string} userId - User ID
   * @param {Object} token - Oura OAuth token
   * @returns {Object} Integration status
   */
  async integrateOura(userId, token) {
    try {
      const endpoints = {
        sleep: '/sleep',
        activity: '/daily_activity',
        readiness: '/readiness'
      };

      const data = {};
      for (const [metric, endpoint] of Object.entries(endpoints)) {
        const response = await axios.get(
          `${this.platforms.oura.baseUrl}${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        data[metric] = response.data;
      }

      await this.storeHealthData(userId, {
        ...data,
        source: 'Oura Ring'
      });

      return { success: true, platform: 'Oura Ring' };
    } catch (error) {
      console.error('Error integrating with Oura Ring:', error);
      throw error;
    }
  }

  /**
   * Integrate with Suunto
   * @param {string} userId - User ID
   * @param {Object} token - Suunto OAuth token
   * @returns {Object} Integration status
   */
  async integrateSuunto(userId, token) {
    try {
      const endpoints = {
        heartRate: '/heart-rates',
        activity: '/activities',
        training: '/training'
      };

      const data = {};
      for (const [metric, endpoint] of Object.entries(endpoints)) {
        const response = await axios.get(
          `${this.platforms.suunto.baseUrl}${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        data[metric] = response.data;
      }

      await this.storeHealthData(userId, {
        ...data,
        source: 'Suunto'
      });

      return { success: true, platform: 'Suunto' };
    } catch (error) {
      console.error('Error integrating with Suunto:', error);
      throw error;
    }
  }

  /**
   * Store health data from any platform
   * @param {string} userId - User ID
   * @param {Object} data - Health data
   * @returns {Object} Stored health data
   */
  async storeHealthData(userId, data) {
    try {
      const healthData = new HealthData({
        userId,
        timestamp: new Date(),
        metrics: data,
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
   * Sync data from all connected platforms
   * @param {string} userId - User ID
   * @returns {Object} Sync status
   */
  async syncAllPlatforms(userId) {
    try {
      const user = await User.findById(userId);
      const results = [];

      for (const [platform, token] of Object.entries(user.healthPlatforms)) {
        if (token) {
          try {
            let result;
            switch (platform) {
              case 'appleHealth':
                result = await this.integrateAppleHealth(userId, token);
                break;
              case 'garmin':
                result = await this.integrateGarmin(userId, token);
                break;
              case 'polar':
                result = await this.integratePolar(userId, token);
                break;
              case 'whoop':
                result = await this.integrateWhoop(userId, token);
                break;
              case 'oura':
                result = await this.integrateOura(userId, token);
                break;
              case 'suunto':
                result = await this.integrateSuunto(userId, token);
                break;
            }
            results.push({ platform, success: true, ...result });
          } catch (error) {
            results.push({
              platform,
              success: false,
              error: error.message
            });
          }
        }
      }

      return {
        success: results.some(r => r.success),
        results
      };
    } catch (error) {
      console.error('Error syncing platforms:', error);
      throw error;
    }
  }
}

module.exports = new HealthPlatformService();
