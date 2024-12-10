/**
 * 健康提醒数据模型
 * 管理用户的健康相关提醒
 * @typedef {Object} HealthReminder
 */
const healthReminderSchema = new mongoose.Schema({
  /** 关联的用户ID */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  /** 提醒标题 */
  title: {
    type: String,
    required: true
  },

  /** 提醒内容 */
  content: String,

  /** 
   * 提醒类型
   * @enum ['hydration', 'meal', 'supplement', 'sleep', 'training']
   */
  type: {
    type: String,
    enum: ['hydration', 'meal', 'supplement', 'sleep', 'training'],
    required: true
  },

  /** 提醒时间 */
  scheduledTime: {
    type: Date,
    required: true
  },

  /** 
   * 重复规则
   * @enum ['once', 'daily', 'weekly']
   */
  recurrence: {
    type: String,
    enum: ['once', 'daily', 'weekly'],
    default: 'once'
  },

  /** 是否启用 */
  isEnabled: {
    type: Boolean,
    default: true
  },

  /** 上次提醒时间 */
  lastTriggered: Date,

  /** 用户反馈 */
  feedback: {
    isHelpful: Boolean,
    comment: String
  }
}, {
  timestamps: true
});

// 添加索引
healthReminderSchema.index({ user: 1, scheduledTime: 1 });
healthReminderSchema.index({ user: 1, type: 1 }); 