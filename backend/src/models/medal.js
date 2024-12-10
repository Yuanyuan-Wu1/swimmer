const mongoose = require('mongoose');

/**
 * 勋章数据模型
 * 记录用户获得的成就勋章
 * @typedef {Object} Medal
 */
const medalSchema = new mongoose.Schema({
  /** 关联的用户ID */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  /** 
   * 勋章类型
   * @enum ['standard', 'champs', 'improvement', 'attendance']
   */
  type: {
    type: String,
    required: true,
    enum: ['standard', 'champs', 'improvement', 'attendance']
  },

  /** 勋章等级 */
  level: String,

  /** 获得时间 */
  earnedDate: {
    type: Date,
    default: Date.now
  },

  /** 关联的比赛项目 */
  event: String,

  /** 
   * 勋章状态
   * @enum ['active', 'expired']
   */
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active'
  }
});

// 添加索引
medalSchema.index({ user: 1, type: 1 });
medalSchema.index({ earnedDate: -1 });

const Medal = mongoose.model('Medal', medalSchema);

module.exports = Medal;
