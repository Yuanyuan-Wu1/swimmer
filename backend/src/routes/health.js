const router = require('express').Router();
const DBMonitor = require('../utils/dbMonitor');

router.get('/health', async (req, res) => {
  try {
    const dbStatus = await DBMonitor.checkConnection();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router; 