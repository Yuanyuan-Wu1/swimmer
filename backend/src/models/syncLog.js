const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['roster', 'times', 'westteam', 'all']
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed', 'partial']
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  details: {
    recordsProcessed: Number,
    recordsUpdated: Number,
    errors: [String]
  }
});

module.exports = mongoose.model('SyncLog', syncLogSchema); 