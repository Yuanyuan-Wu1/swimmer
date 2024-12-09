const mongoose = require('mongoose');

const trainingPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  targetEvents: [{
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
    ]
  }],
  currentLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'elite'],
    required: true
  },
  weeklySchedule: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    sessions: [{
      type: {
        type: String,
        enum: ['swim', 'dryland', 'recovery'],
        required: true
      },
      focus: String,
      mainSet: [{
        description: String,
        distance: Number,
        intensity: {
          type: String,
          enum: ['easy', 'moderate', 'hard', 'sprint']
        },
        repetitions: Number
      }],
      duration: Number, // in minutes
      notes: String
    }]
  }],
  drylandExercises: [{
    name: String,
    sets: Number,
    reps: Number,
    notes: String
  }],
  generatedBy: {
    type: String,
    enum: ['openai', 'coach', 'system'],
    default: 'system'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  progressNotes: [{
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    metrics: {
      fatigue: {
        type: Number,
        min: 1,
        max: 10
      },
      performance: {
        type: Number,
        min: 1,
        max: 10
      },
      motivation: {
        type: Number,
        min: 1,
        max: 10
      }
    }
  }]
}, {
  timestamps: true
});

const TrainingPlan = mongoose.model('TrainingPlan', trainingPlanSchema);

module.exports = TrainingPlan;
