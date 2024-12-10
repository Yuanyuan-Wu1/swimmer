/**
 * 主路由配置
 * @module routes/index
 */
const router = require('express').Router();

/** 标准时间路由 */
router.use('/standards', require('./standards'));

/** 成绩路由 */
router.use('/performances', require('./performances')); 

/** 勋章路由 */
router.use('/medals', require('./medals'));

module.exports = router; 