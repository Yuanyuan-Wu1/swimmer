const mongoose = require('mongoose');

/**
 * 训练计划数据模型
 * 存储个性化训练计划
 * @typedef {Object} TrainingPlan
 */
const trainingPlanSchema = new mongoose.Schema({
  /** 关联的用户ID */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  /** 计划名称 */
  name: String,

  /** 计划开始日期 */
  startDate: Date,

  /** 计划结束日期 */
  endDate: Date,

  /** 
   * 训练目标
   * @property {string} event - 目标项目
   * @property {number} targetTime - 目标时间(毫秒)
   */
  goals: [{
    event: String,
    targetTime: Number
  }],

  /** 
   * 训练安排
   * @property {Date} date - 训练日期
   * @property {string} type - 训练类型
   * @property {Object} details - 训练详情
   */
  sessions: [{
    date: Date,
    type: String,
    details: {
      warmup: String,
      mainSet: String,
      cooldown: String
    }
  }],

  /** 
   * 计划状态
   * @enum ['active', 'completed', 'cancelled']
   */
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
});

// 添加索引
trainingPlanSchema.index({ user: 1, status: 1 });
trainingPlanSchema.index({ startDate: 1 });

const TrainingPlan = mongoose.model('TrainingPlan', trainingPlanSchema);

module.exports = TrainingPlan;
