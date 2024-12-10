const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// 注册新用户
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 获取当前用户信息
router.get('/me', auth, getCurrentUser);

module.exports = router;
