/**
 * 数据库监控工具
 */
const mongoose = require('mongoose');

class DBMonitor {
  static async checkConnection() {
    const state = mongoose.connection.readyState;
    return {
      connected: state === 1,
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][state]
    };
  }

  static async getStats() {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    const db = mongoose.connection.db;
    return {
      collections: await db.listCollections().toArray(),
      stats: await db.stats()
    };
  }
}

module.exports = DBMonitor; 