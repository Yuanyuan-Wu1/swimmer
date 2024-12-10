const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Performance = require('../models/performance');
const Medal = require('../models/medal');

// Get all performances for a user
router.get('/performances', auth, async (req, res) => {
  try {
    const performances = await Performance.find({ user: req.user._id })
      .sort({ date: -1 })
      .populate('competition');
    res.json(performances);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Add new performance
router.post('/performances', auth, async (req, res) => {
  try {
    const performance = new Performance({
      ...req.body,
      user: req.user._id
    });
    await performance.save();

    // Check for personal best and award medals if applicable
    const previousBest = await Performance.findOne({
      user: req.user._id,
      event: performance.event
    }).sort({ time: 1 });

    if (!previousBest || performance.time < previousBest.time) {
      performance.isPersonalBest = true;
      await performance.save();

      // Create medal for personal best
      const medal = new Medal({
        user: req.user._id,
        type: 'IMPROVEMENT_3SEC',
        event: performance.event,
        description: `New personal best in ${performance.event}`,
        relatedPerformance: performance._id
      });
      await medal.save();
    }

    res.status(201).json(performance);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get personal bests for all events
router.get('/performances/personal-bests', auth, async (req, res) => {
  try {
    const events = await Performance.distinct('event', { user: req.user._id });
    const personalBests = await Promise.all(
      events.map(async (event) => {
        const best = await Performance.findOne({
          user: req.user._id,
          event
        })
        .sort({ time: 1 })
        .populate('competition');
        return best;
      })
    );
    res.json(personalBests.filter(Boolean));
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get performance history for specific event
router.get('/performances/:event', auth, async (req, res) => {
  try {
    const performances = await Performance.find({
      user: req.user._id,
      event: req.params.event
    })
    .sort({ date: -1 })
    .populate('competition');
    res.json(performances);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
