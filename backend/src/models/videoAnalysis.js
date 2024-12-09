const mongoose = require('mongoose');

const strokeAnalysisSchema = new mongoose.Schema({
  strokeType: {
    type: String,
    enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'],
    required: true
  },
  strokeRate: Number,  // Strokes per minute
  strokeLength: Number, // Distance per stroke in meters
  bodyPosition: {
    head: String,
    shoulders: String,
    hips: String,
    legs: String
  },
  armMovement: {
    entry: String,
    catch: String,
    pull: String,
    recovery: String
  },
  legMovement: {
    kickPattern: String,
    kickDepth: String,
    kickTiming: String
  },
  timing: {
    strokeCycle: Number, // Time in seconds
    turnTime: Number,   // Time in seconds
    underwaterTime: Number // Time in seconds
  }
});

const videoAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    url: {
      type: String,
      required: true
    },
    filename: String,
    duration: Number,  // Duration in seconds
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  comparisonVideo: {
    url: String,
    filename: String,
    duration: Number,
    uploadDate: Date,
    description: String,
    type: {
      type: String,
      enum: ['reference', 'previous', 'custom']
    }
  },
  comparisonAnalysis: {
    similarities: [String],
    differences: [String],
    improvements: [String],
    recommendations: [String]
  },
  event: {
    type: String,
    enum: [
      // SCY Events
      '50_FR_SCY', '100_FR_SCY', '200_FR_SCY', '500_FR_SCY',
      '50_BK_SCY', '100_BK_SCY',
      '50_BR_SCY', '100_BR_SCY',
      '50_FL_SCY', '100_FL_SCY',
      '100_IM_SCY', '200_IM_SCY',
      // LCM Events
      '50_FR_LCM', '100_FR_LCM', '200_FR_LCM', '400_FR_LCM',
      '50_BK_LCM', '100_BK_LCM',
      '50_BR_LCM', '100_BR_LCM',
      '50_FL_LCM', '100_FL_LCM',
      '200_IM_LCM'
    ],
    required: true
  },
  strokeAnalysis: strokeAnalysisSchema,
  aiAnalysis: {
    technicalFeedback: [String],
    improvements: [String],
    strengths: [String],
    recommendedDrills: [{
      name: String,
      description: String,
      focus: String
    }]
  },
  annotations: [{
    timestamp: Number,  // Time in seconds
    description: String,
    type: {
      type: String,
      enum: ['technique', 'position', 'timing', 'general']
    }
  }],
  performance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Performance'
  },
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'failed'],
    default: 'pending'
  },
  metrics: {
    distance: Number,     // Total distance in meters
    averageSpeed: Number, // Meters per second
    splits: [{
      distance: Number,
      time: Number,
      strokeCount: Number
    }]
  }
}, {
  timestamps: true
});

// Index for efficient querying
videoAnalysisSchema.index({ user: 1, event: 1 });
videoAnalysisSchema.index({ 'video.uploadDate': -1 });

const VideoAnalysis = mongoose.model('VideoAnalysis', videoAnalysisSchema);

module.exports = VideoAnalysis;
