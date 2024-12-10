/**
 * MongoDB数据库配置
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 使用MongoDB Atlas连接字符串
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Atlas特定配置
      retryWrites: true,
      w: 'majority'
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
