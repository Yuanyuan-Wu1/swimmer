const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rankingsService = require('../services/rankings');

// Get event rankings
router.get('/event/:event', auth, async (req, res) => {
  try {
    const { event } = req.params;
    const { ageGroup, gender, dateRange } = req.query;
    
    const rankings = await rankingsService.getEventRankings(
      event,
      { ageGroup, gender, dateRange }
    );
    
    res.json(rankings);
  } catch (error) {
    console.error('Error getting event rankings:', error);
    res.status(500).json({ message: 'Error getting event rankings' });
  }
});

// Get FINA points rankings
router.get('/fina-points', auth, async (req, res) => {
  try {
    const { ageGroup, gender, dateRange } = req.query;
    
    const rankings = await rankingsService.getFinaPointsRankings(
      { ageGroup, gender, dateRange }
    );
    
    res.json(rankings);
  } catch (error) {
    console.error('Error getting FINA points rankings:', error);
    res.status(500).json({ message: 'Error getting FINA points rankings' });
  }
});

// Get athlete rankings
router.get('/athletes', auth, async (req, res) => {
  try {
    const { ageGroup, gender } = req.query;
    
    const rankings = await rankingsService.getAthleteRankings(
      { ageGroup, gender }
    );
    
    res.json(rankings);
  } catch (error) {
    console.error('Error getting athlete rankings:', error);
    res.status(500).json({ message: 'Error getting athlete rankings' });
  }
});

// Get team rankings
router.get('/teams', auth, async (req, res) => {
  try {
    const { dateRange } = req.query;
    
    const rankings = await rankingsService.getTeamRankings(
      { dateRange }
    );
    
    res.json(rankings);
  } catch (error) {
    console.error('Error getting team rankings:', error);
    res.status(500).json({ message: 'Error getting team rankings' });
  }
});

module.exports = router;
