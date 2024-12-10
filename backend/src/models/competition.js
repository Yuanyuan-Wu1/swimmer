const mongoose = require('mongoose');

/**
 * 比赛数据模型
 * 存储比赛信息和成绩记录
 * @typedef {Object} Competition
 */
const competitionSchema = new mongoose.Schema({
  /** 比赛名称 */
  name: String,

  /** 比赛日期 */
  date: Date,

  /** 比赛地点 */
  location: String,

  /** 
   * 比赛类型
   * @enum ['meet', 'time_trial', 'practice']
   */
  type: { 
    type: String, 
    enum: ['meet', 'time_trial', 'practice'] 
  },

  /** 
   * 比赛项目列表
   * @property {string} name - 项目名称
   * @property {number} distance - 距离(米)
   * @property {string} stroke - 泳姿
   * @property {string} course - 泳池类型(SCY, LCM, SCM)
   */
  events: [{
    name: String,
    distance: Number,
    stroke: String,
    course: String
  }],

  /** 参赛选手列表 */
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],

  /** 
   * 比赛成绩
   * @property {ObjectId} user - 选手ID
   * @property {string} event - 比赛项目
   * @property {number} time - 成绩(毫秒)
   * @property {number} place - 名次
   */
  results: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event: String,
    time: Number,
    place: Number
  }]
});

// 添加索引
competitionSchema.index({ date: -1 });
competitionSchema.index({ 'results.user': 1 });

const Competition = mongoose.model('Competition', competitionSchema);

module.exports = Competition;
