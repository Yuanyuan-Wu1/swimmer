const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const TrainingPlan = require('../models/trainingPlan');
const openaiService = require('../services/openai');

// Generate new training plan
router.post('/generate', auth, async (req, res) => {
  try {
    const { targetEvents, currentLevel, goal } = req.body;

    // Generate plan using OpenAI
    const planData = await openaiService.generateTrainingPlan({
      user: req.user,
      targetEvents,
      currentLevel,
      goal
    });

    // Create new training plan
    const trainingPlan = new TrainingPlan({
      user: req.user._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week plan
      goal,
      targetEvents,
      currentLevel,
      weeklySchedule: planData.weeklySchedule,
      drylandExercises: planData.drylandExercises,
      generatedBy: 'openai'
    });

    await trainingPlan.save();
    res.status(201).json(trainingPlan);
  } catch (error) {
    console.error('Error generating training plan:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's active training plan
router.get('/active', auth, async (req, res) => {
  try {
    const activePlan = await TrainingPlan.findOne({
      user: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!activePlan) {
      return res.status(404).json({ message: 'No active training plan found' });
    }

    res.json(activePlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update training plan progress
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { note, metrics } = req.body;
    const plan = await TrainingPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Training plan not found' });
    }

    plan.progressNotes.push({
      note,
      metrics
    });

    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI feedback on workout
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { workoutData } = req.body;
    const feedback = await openaiService.generateWorkoutFeedback(workoutData);
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete training plan
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const plan = await TrainingPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Training plan not found' });
    }

    plan.status = 'completed';
    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
