/**
 * 成绩管理控制器
 * 处理成绩相关的HTTP请求
 */
class PerformanceController {
  /**
   * 获取用户成绩摘要
   * @route GET /api/performances/summary
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  async getSummary(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      // 获取最近成绩
      const performances = await Performance.find({ user: userId })
        .sort({ date: -1 })
        .limit(10);

      // 检查标准时间达标情况
      const standards = await standardsService.checkStandards(
        performances,
        user.profile
      );

      // 检查锦标赛资格
      const champsQualifications = await champsStandardsService.checkQualifications(
        performances,
        user.profile
      );

      res.json({
        performances,
        standards,
        champsQualifications
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 添加新成绩
   * @route POST /api/performances
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  async addPerformance(req, res) {
    try {
      const performance = await performanceService.addPerformance(
        req.user.id,
        req.body
      );
      res.status(201).json(performance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * 获取成绩列表
   * @route GET /api/performances
   * @param {Request} req - Express请求对象
   * @param {Response} res - Express响应对象
   */
  async getPerformances(req, res) {
    try {
      const performances = await performanceService.getPerformances(
        req.user.id,
        req.query
      );
      res.json(performances);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new PerformanceController(); 