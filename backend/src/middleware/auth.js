const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * JWT认证中间件
 * 验证请求头中的token并解析用户信息
 * 
 * @param {Request} req - Express请求对象
 * @param {Response} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error();
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      throw new Error();
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// 管理员权限中间件
const adminAuth = async (req, res, next) => {
  try {
    await authMiddleware(req, res, () => {
      if (req.user.role !== 'admin') {
        throw new Error('Admin privileges required');
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Admin privileges required' });
  }
};

module.exports = { authMiddleware, adminAuth };
