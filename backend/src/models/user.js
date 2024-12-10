const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const integrationSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  westTeam: {
    id: String,
    lastSync: Date
  },
  swimCloud: {
    id: String,
    lastSync: Date
  },
  garmin: {
    token: String,
    refreshToken: String,
    lastSync: Date
  },
  appleHealth: {
    enabled: Boolean,
    lastSync: Date
  }
});

/**
 * 用户数据模型
 * 存储用户基本信息和第三方平台集成配置
 * @typedef {Object} User
 */
const userSchema = new mongoose.Schema({
  /** 用户名 */
  name: String,

  /** 
   * 邮箱地址
   * @unique 唯一索引
   */
  email: { 
    type: String, 
    unique: true 
  },

  /** 加密后的密码 */
  password: String,

  /** 
   * 用户角色
   * @enum ['swimmer', 'coach', 'admin']
   */
  role: { 
    type: String, 
    enum: ['swimmer', 'coach', 'admin'] 
  },

  /** 
   * 用户档案
   * @property {number} age - 年龄
   * @property {string} team - 所属团队
   * @property {string} swimCloudId - SwimCloud ID
   * @property {string} westTeamId - West Team ID
   */
  profile: {
    age: Number,
    team: String,
    swimCloudId: String,
    westTeamId: String
  },

  /** 第三方平台集成配置 */
  integrations: integrationSchema
});

/**
 * 密码加密中间件
 * 在保存用户前自动加密密码
 */
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

/**
 * 验证密码
 * @param {string} password - 待验证的密码
 * @returns {Promise<boolean>} 验证结果
 */
userSchema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
