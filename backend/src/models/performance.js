const mongoose = require('mongoose');

/**
 * 游泳成绩数据模型
 * @typedef {Object} Performance
 */
const performanceSchema = new mongoose.Schema({
  /** 关联的用户ID */
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },

  /** 比赛项目(如: "50_FR_SCY") */
  event: {
    type: String,
    required: true,
    enum: [
      // SCY Events (短码)
      '50_FR_SCY', '100_FR_SCY', '200_FR_SCY', '500_FR_SCY',
      // ... 其他项目
    ]
  },

  /** 
   * 成绩时间
   * @property {number} value - 毫秒表示的时间
   * @property {string} displayValue - 显示格式的时间("MM:SS.ms")
   */
  time: {
    value: Number,
    displayValue: String
  },

  /** 比赛日期 */
  date: Date,

  /** 数据来源 */
  source: {
    type: String,
    enum: ['manual', 'swimcloud', 'westteam'],
    required: true
  }
  // ... 其他字段
});

// Index for efficient querying of personal bests
performanceSchema.index({ user: 1, event: 1, time: 1 });

// 添加索引以提高查询性能
performanceSchema.index({ user: 1, event: 1, date: -1 });
performanceSchema.index({ competition: 1 });
performanceSchema.index({ date: -1 });

const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;
