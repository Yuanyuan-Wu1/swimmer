const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,  // 训练时长（分钟）
    required: true
  },
  type: {
    type: String,  // 训练类型：技术训练、体能训练等
    required: true
  },
  sets: [{
    distance: Number,     // 距离（米）
    style: String,       // 泳姿
    time: String,        // 完成时间
    restInterval: Number // 休息时间（秒）
  }],
  notes: String,         // 训练笔记
  mood: {
    type: String,
    enum: ['great', 'good', 'normal', 'tired', 'exhausted']
  },
  intensity: {
    type: Number,        // 1-10的训练强度
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

const Training = mongoose.model('Training', trainingSchema);

module.exports = Training;
