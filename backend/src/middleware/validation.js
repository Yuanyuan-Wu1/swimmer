/**
 * 请求数据验证中间件
 * 验证请求体中的数据格式是否正确
 */
const validationMiddleware = {
  /**
   * 验证用户注册数据
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   * @param {Function} next - 下一个中间件
   */
  validateRegister: (req, res, next) => {
    const { email, password, name } = req.body;

    // 验证邮箱格式
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // 验证密码长度
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // 验证用户名
    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    next();
  },

  /**
   * 验证成绩数据
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   * @param {Function} next - 下一个中间件
   */
  validatePerformance: (req, res, next) => {
    // ... 实现代码
  }
}; 