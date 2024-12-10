/**
 * 比赛路由
 * @module routes/competition
 */
const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const competitionController = require('../controllers/competitionController');

/**
 * 获取比赛列表
 * @route GET /api/competitions
 * @authentication 需要认证
 */
router.get('/', authMiddleware, competitionController.getCompetitions);

/**
 * 获取单个比赛详情
 * @route GET /api/competitions/:id
 * @authentication 需要认证
 */
router.get('/:id', authMiddleware, competitionController.getCompetition);

module.exports = router;
