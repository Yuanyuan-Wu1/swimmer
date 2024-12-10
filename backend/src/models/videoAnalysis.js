const mongoose = require('mongoose');

/**
 * 视频分析数据模型
 * 存储技术分析视频和反馈
 * @typedef {Object} VideoAnalysis
 */
const videoAnalysisSchema = new mongoose.Schema({
  /** 关联的用户ID */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  /** 视频URL */
  videoUrl: String,

  /** 录制日期 */
  recordedDate: Date,

  /** 
   * 泳姿类型
   * @enum ['freestyle', 'backstroke', 'breaststroke', 'butterfly']
   */
  stroke: {
    type: String,
    enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly']
  },

  /** 
   * 分析结果
   * @property {string} aspect - 分析方面
   * @property {string} feedback - 反馈内容
   * @property {string[]} suggestions - 改进建议
   */
  analysis: [{
    aspect: String,
    feedback: String,
    suggestions: [String]
  }],

  /** 教练评论 */
  coachComments: String,

  /** 
   * 分析状态
   * @enum ['pending', 'analyzed', 'reviewed']
   */
  status: {
    type: String,
    enum: ['pending', 'analyzed', 'reviewed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// 添加索引
videoAnalysisSchema.index({ user: 1, recordedDate: -1 });
videoAnalysisSchema.index({ status: 1 });

const VideoAnalysis = mongoose.model('VideoAnalysis', videoAnalysisSchema);

module.exports = VideoAnalysis;
