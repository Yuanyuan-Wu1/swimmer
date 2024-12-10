const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const swimCloudSync = require('../services/swimCloudSync');

// 手动触发同步 (仅管理员)
router.post('/sync', [auth, admin], async (req, res) => {
  try {
    const { type } = req.body;
    let result;

    switch (type) {
      case 'roster':
        result = await swimCloudSync.syncRoster();
        break;
      case 'times':
        result = await swimCloudSync.syncTimes();
        break;
      case 'westteam':
        result = await swimCloudSync.syncWestTeamResults();
        break;
      case 'all':
        result = await Promise.all([
          swimCloudSync.syncRoster(),
          swimCloudSync.syncTimes(),
          swimCloudSync.syncWestTeamResults()
        ]);
        break;
      default:
        return res.status(400).json({ error: 'Invalid sync type' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// 获取同步状态
router.get('/sync/status', auth, async (req, res) => {
  try {
    const lastSync = await SyncLog.findOne().sort({ date: -1 });
    res.json(lastSync);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

module.exports = router; 