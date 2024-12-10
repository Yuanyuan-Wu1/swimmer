// 添加安全配置
module.exports = {
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }
}; 