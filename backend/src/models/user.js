const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    age: Number,
    gender: String,
    height: Number,  // in cm
    weight: Number,  // in kg
    specialties: [String],  // 特长泳姿
    level: String    // 水平等级
  },
  personalBests: [{
    event: String,   // 比如 "50m freestyle"
    time: String,    // 格式 "MM:SS.ms"
    date: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// 验证密码的方法
userSchema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
