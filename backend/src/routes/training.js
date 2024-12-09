const express = require('express');
const router = express.Router();

// 获取训练记录列表
router.get('/', (req, res) => {
  res.json({ message: 'Get training records endpoint' });
});

// 添加训练记录
router.post('/', (req, res) => {
  res.json({ message: 'Create training record endpoint' });
});

// 更新训练记录
router.put('/:id', (req, res) => {
  res.json({ message: 'Update training record endpoint' });
});

// 删除训练记录
router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete training record endpoint' });
});

module.exports = router;
