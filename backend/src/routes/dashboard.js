const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Performance = require('../models/performance');
const Medal = require('../models/medal');
const Event = require('../models/event');
const Training = require('../models/training');

// Get recent performances
router.get('/performance/recent', auth, async (req, res) => {
  try {
    const performances = await Performance.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(10);
    res.json(performances);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get upcoming events
router.get('/events/upcoming', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({
      date: { $gte: currentDate },
      $or: [
        { participants: req.user._id },
        { isPublic: true }
      ]
    })
    .sort({ date: 1 })
    .limit(5);
    res.json(events);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get medals summary
router.get('/medal/summary', auth, async (req, res) => {
  try {
    const medals = await Medal.find({ user: req.user._id });
    const earnedMedals = medals.filter(medal => medal.earned);
    const recentMedal = earnedMedals[0];

    res.json({
      total: earnedMedals.length,
      recentAchievement: recentMedal ? recentMedal.name : null,
      byCategory: {
        achievement: earnedMedals.filter(m => m.type.includes('STANDARD')).length,
        progress: earnedMedals.filter(m => m.type.includes('PROGRESS')).length,
        training: earnedMedals.filter(m => m.type.includes('TRAINING')).length,
        special: earnedMedals.filter(m => 
          m.type.includes('TIME') || 
          m.type.includes('PLACE') || 
          m.type.includes('FINISH')
        ).length
      }
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get training progress
router.get('/training/progress', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    
    const currentPlan = await Training.findOne({
      user: req.user._id,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).sort({ startDate: -1 });

    if (!currentPlan) {
      return res.json({
        weeklyProgress: 0,
        nextSession: null,
        currentPlan: null
      });
    }

    // Calculate weekly progress
    const completedSessions = currentPlan.sessions.filter(session => 
      session.completed && 
      new Date(session.date) >= startOfWeek
    ).length;
    
    const totalWeeklySessions = currentPlan.sessions.filter(session => 
      new Date(session.date) >= startOfWeek
    ).length;

    const weeklyProgress = totalWeeklySessions > 0 
      ? (completedSessions / totalWeeklySessions) * 100 
      : 0;

    // Find next session
    const nextSession = currentPlan.sessions.find(session => 
      !session.completed && 
      new Date(session.date) >= currentDate
    );

    res.json({
      weeklyProgress,
      nextSession: nextSession ? nextSession.date : null,
      currentPlan: {
        name: currentPlan.name,
        goals: currentPlan.goals.map(goal => ({
          description: goal.description,
          progress: goal.progress || 0
        }))
      }
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get FINA points
router.get('/performance/fina-points', auth, async (req, res) => {
  try {
    const performances = await Performance.find({ user: req.user._id })
      .sort({ finaPoints: -1 })
      .limit(1);

    if (performances.length === 0) {
      return res.json({
        bestPoints: 0,
        bestEvent: null
      });
    }

    const bestPerformance = performances[0];
    res.json({
      bestPoints: bestPerformance.finaPoints || 0,
      bestEvent: bestPerformance.event
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
