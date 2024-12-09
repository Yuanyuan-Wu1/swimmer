const mongoose = require('mongoose');

const medalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      // Achievement Medals (Based on Time Standards)
      'AAAA_STANDARD',
      'AAA_STANDARD',
      'AA_STANDARD',
      'A_STANDARD',
      'BB_STANDARD',
      'B_STANDARD',
      
      // Progress Medals
      'PROGRESS_10SEC',
      'PROGRESS_5SEC',
      'PROGRESS_3SEC',
      
      // Training Medals
      'TRAINING_60DAYS',
      'TRAINING_30DAYS',
      'TRAINING_WEEKLY',
      
      // Event Specific Medals
      'FIRST_COMPETITION',
      'TOP_8_FINISH',
      'FIRST_PLACE',
      
      // Special Achievement Medals
      'GOLD_TIME',
      'SILVER_TIME',
      'BRONZE_TIME'
    ]
  },
  name: {
    type: String,
    required: true
  },
  event: {
    type: String,
    required: function() {
      return this.type.includes('STANDARD') || 
             this.type.includes('PROGRESS') || 
             this.type.includes('TIME') ||
             this.type.includes('FINISH') ||
             this.type.includes('PLACE');
    }
  },
  earnedDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  requirement: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  earned: {
    type: Boolean,
    default: false
  },
  relatedPerformances: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Performance'
  }],
  targetTime: {
    type: Number,  // Target time in milliseconds
    required: function() {
      return this.type.includes('STANDARD') || this.type.includes('TIME');
    }
  },
  currentBestTime: {
    type: Number,  // Current best time in milliseconds
    required: function() {
      return this.type.includes('STANDARD') || this.type.includes('TIME');
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for time improvement needed
medalSchema.virtual('timeToImprove').get(function() {
  if (!this.targetTime || !this.currentBestTime) return null;
  return Math.max(0, this.currentBestTime - this.targetTime);
});

// Index for efficient querying
medalSchema.index({ user: 1, type: 1, event: 1 });
medalSchema.index({ user: 1, earned: 1 });

const Medal = mongoose.model('Medal', medalSchema);

module.exports = Medal;
