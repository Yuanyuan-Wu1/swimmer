const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Medal = require('../models/medal');

// Get all medals for a user
router.get('/medals', auth, async (req, res) => {
  try {
    const medals = await Medal.find({ user: req.user._id })
      .sort({ earnedDate: -1 })
      .populate('relatedPerformance');
    res.json(medals);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get medals by type
router.get('/medals/type/:type', auth, async (req, res) => {
  try {
    const medals = await Medal.find({
      user: req.user._id,
      type: req.params.type
    })
    .sort({ earnedDate: -1 })
    .populate('relatedPerformance');
    res.json(medals);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get medals for specific event
router.get('/medals/event/:event', auth, async (req, res) => {
  try {
    const medals = await Medal.find({
      user: req.user._id,
      event: req.params.event
    })
    .sort({ earnedDate: -1 })
    .populate('relatedPerformance');
    res.json(medals);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Admin only: Create custom medal
router.post('/medals/custom', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).send({ error: 'Only admins can create custom medals' });
    }

    const medal = new Medal({
      ...req.body,
      type: 'CUSTOM',
      earnedDate: new Date()
    });
    await medal.save();
    res.status(201).json(medal);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
