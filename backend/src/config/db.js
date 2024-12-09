const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 超时时间设置为5秒
      socketTimeoutMS: 45000, // Socket超时时间
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // 添加错误处理
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
