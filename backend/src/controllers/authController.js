const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 生成JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// 注册
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 检查用户是否已存在
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 创建新用户
    const user = await User.create({
      email,
      password,
      name
    });

    // 生成token
    const token = generateToken(user._id);

    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 登录
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 验证密码
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 生成token
    const token = generateToken(user._id);

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};
