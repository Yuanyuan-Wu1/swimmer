const express = require('express');
const router = express.Router();

// 获取比赛记录列表
router.get('/', (req, res) => {
  res.json({ message: 'Get competition records endpoint' });
});

// 添加比赛记录
router.post('/', (req, res) => {
  res.json({ message: 'Create competition record endpoint' });
});

// 更新比赛记录
router.put('/:id', (req, res) => {
  res.json({ message: 'Update competition record endpoint' });
});

// 删除比赛记录
router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete competition record endpoint' });
});

module.exports = router;
