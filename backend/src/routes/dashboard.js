/**
 * 仪表板路由
 * @module routes/dashboard
 */
const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

/**
 * 获取仪表板数据
 * @route GET /api/dashboard
 * @authentication 需要认证
 */
router.get('/', authMiddleware, dashboardController.getDashboard);

/**
 * 获取最近活动
 * @route GET /api/dashboard/activities
 * @authentication 需要认证
 */
router.get('/activities', authMiddleware, dashboardController.getActivities);

module.exports = router;
