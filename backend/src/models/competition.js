const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: String,
  events: [{
    name: String,          // 比如 "50m freestyle"
    time: String,          // 成绩
    rank: Number,          // 名次
    personalBest: Boolean  // 是否是个人最好成绩
  }],
  level: {
    type: String,          // 比赛级别：地区赛、全国赛等
    required: true
  },
  notes: String,           // 比赛笔记
  medals: [{
    type: String,
    enum: ['gold', 'silver', 'bronze']
  }]
}, {
  timestamps: true
});

const Competition = mongoose.model('Competition', competitionSchema);

module.exports = Competition;
