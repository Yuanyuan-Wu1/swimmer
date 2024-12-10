/**
 * 数据库初始化脚本
 */
const connectDB = require('../src/config/db');
const Standards = require('../models/standards');
const MOCK_DATA = require('../src/config/mockData');

async function initDatabase() {
  try {
    // 连接数据库
    await connectDB();
    
    // 检查是否已有数据
    const count = await Standards.countDocuments();
    if (count > 0) {
      console.log('Database already initialized');
      return;
    }

    // 插入模拟数据
    await Standards.insertMany(MOCK_DATA.standards);
    console.log('Mock data inserted successfully');

  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

if (require.main === module) {
  initDatabase();
} 