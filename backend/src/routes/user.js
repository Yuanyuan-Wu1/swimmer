const express = require('express');
const router = express.Router();

// 获取用户信息
router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile endpoint' });
});

// 更新用户信息
router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile endpoint' });
});

module.exports = router;
