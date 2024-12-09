const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: String,
    required: true,
    enum: [
      // SCY Events
      '50_FR_SCY', '100_FR_SCY', '200_FR_SCY', '500_FR_SCY',
      '50_BK_SCY', '100_BK_SCY',
      '50_BR_SCY', '100_BR_SCY',
      '50_FL_SCY', '100_FL_SCY',
      '100_IM_SCY', '200_IM_SCY',
      '200_FR_R_SCY', '200_MED_R_SCY',
      
      // LCM Events
      '50_FR_LCM', '100_FR_LCM', '200_FR_LCM', '400_FR_LCM',
      '50_BK_LCM', '100_BK_LCM',
      '50_BR_LCM', '100_BR_LCM',
      '50_FL_LCM', '100_FL_LCM',
      '200_IM_LCM',
      '200_FR_R_LCM', '200_MED_R_LCM'
    ]
  },
  time: {
    type: String,    // Format: "MM:SS.ms"
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  competition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition'
  },
  isPersonalBest: {
    type: Boolean,
    default: false
  },
  finaPoints: {
    type: Number
  },
  videoAnalysis: {
    url: String,
    notes: String,
    technicalFeedback: [String]
  },
  splits: [{
    distance: Number,
    time: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying of personal bests
performanceSchema.index({ user: 1, event: 1, time: 1 });

const Performance = mongoose.model('Performance', performanceSchema);

module.exports = Performance;
