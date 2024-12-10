const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * 用户认证控制器
 * 处理用户注册、登录等认证相关请求
 * @module controllers/auth
 */
class AuthController {
  /**
   * 用户注册
   * @route POST /api/auth/register
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // 检查邮箱是否已注册
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // 创建新用户
      const user = new User({
        email,
        password,
        name
      });
      await user.save();

      // 生成token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ token, user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 用户登录
   * @route POST /api/auth/login
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  async login(req, res) {
    // ... 实现代码
  }
}

module.exports = {
  register,
  login,
  getCurrentUser
};
