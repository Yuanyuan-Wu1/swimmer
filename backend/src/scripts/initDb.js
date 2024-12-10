/**
 * 数据库初始化脚本
 * 创建必要的集合和索引
 */
const mongoose = require('mongoose');
const Standards = require('../models/standards');
const { readFileSync } = require('fs');
const path = require('path');

/**
 * 初始化标准时间数据
 * @returns {Promise<void>}
 */
async function initStandards() {
  try {
    // 检查是否已有数据
    const count = await Standards.countDocuments();
    if (count > 0) {
      console.log('Standards data already exists');
      return;
    }

    // 从JSON文件加载数据
    const jsonPath = path.join(__dirname, '../../data/swimming_standards.json');
    const rawData = readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(rawData);

    // 保存到数据库
    await Standards.insertMany(data.standards);
    console.log('Standards data initialized');
  } catch (error) {
    console.error('Error initializing standards:', error);
    throw error;
  }
}

/**
 * 创建数据库索引
 * @returns {Promise<void>}
 */
async function createIndexes() {
  try {
    // 用户索引
    await User.createIndexes();
    
    // 成绩索引
    await Performance.createIndexes();
    
    // 比赛索引
    await Competition.createIndexes();
    
    console.log('Indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await initStandards();
    await createIndexes();

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Initialization error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  initStandards,
  createIndexes
};
