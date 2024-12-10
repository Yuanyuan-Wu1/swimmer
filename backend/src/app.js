const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// 确保CORS中间件是第一个中间件
app.use(cors({
  origin: true,  // 允许所有来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 预检请求缓存24小时
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// 添加OPTIONS请求处理
app.options('*', cors());

// 其他中间件
app.use(express.json());
app.use(morgan('dev'));

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 测试路由
app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'API is working' });
});

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 认证相关路由
app.post('/api/auth/login', (req, res) => {
  res.json({
    token: 'mock_token',
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      profile: { age: 15, gender: 'M' }
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    profile: { age: 15, gender: 'M' }
  });
});

// 成绩相关路由
app.get('/api/performances', (req, res) => {
  res.json([
    {
      id: '1',
      event: '50_FR',
      time: { value: 25.5, displayValue: '25.50' },
      date: '2024-03-10'
    }
  ]);
});

// 勋章相关路由
app.get('/api/medals', (req, res) => {
  res.json([
    {
      id: '1',
      type: 'standard',
      level: 'AAAA',
      achieved: true,
      date: new Date()
    },
    {
      id: '2',
      type: 'standard',
      level: 'AAA',
      achieved: false,
      date: null
    }
  ]);
});

// 标准时相关路由
app.get('/api/standards/motivational', (req, res) => {
  res.json({
    AAAA: {
      '50_FR': '22.50',
      '100_FR': '49.50'
    },
    AAA: {
      '50_FR': '23.50',
      '100_FR': '51.50'
    }
  });
});

// 活动相关路由
app.get('/api/activities/recent', (req, res) => {
  res.json([
    {
      id: '1',
      type: 'training',
      description: 'Morning Practice',
      date: new Date()
    }
  ]);
});

// 比赛相关路由
app.get('/api/competitions/upcoming', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Spring Championship',
      date: '2024-04-15',
      location: 'City Pool'
    }
  ]);
});

// 获取所有标准时间
app.get('/api/standards', (req, res) => {
  res.json({
    standards: SWIMMING_STANDARDS,
    ageGroups: AGE_GROUPS
  });
});

// 获取特定项目的标准时间
app.get('/api/standards/:event', (req, res) => {
  const { event } = req.params;
  const standards = SWIMMING_STANDARDS[event];
  
  if (!standards) {
    return res.status(404).json({ error: 'Event not found' });
  }
  
  res.json(standards);
});

// 获取用户当前水平
app.get('/api/user/current-level', (req, res) => {
  // 这里应该根据用户最近的成绩来判断水平
  // 现在先返回拟数据
  res.json({
    "50_FR": "AA",
    "100_FR": "A",
    "200_FR": "BB"
  });
});

// 添加团队相关路由
app.get('/api/team/messages', (req, res) => {
  res.json([
    {
      id: '1',
      sender: 'Coach',
      content: 'Good job at practice today!',
      timestamp: new Date()
    },
    {
      id: '2',
      sender: 'Team Captain',
      content: 'Remember we have a meet this weekend',
      timestamp: new Date()
    }
  ]);
});

app.get('/api/team/announcements', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Team Meeting',
      content: 'Team meeting this Friday at 5pm',
      date: new Date()
    }
  ]);
});

app.get('/api/team/members', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'John Doe',
      role: 'Swimmer',
      events: ['50 Free', '100 Free']
    }
  ]);
});

// 错误处理中间件 - 放在所有路由之后
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  
  // 处理CORS预检请求错误
  if (err.name === 'TypeError' && err.message.includes('CORS')) {
    return res.status(200).set({
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With'
    }).end();
  }
  
  // 其他错误
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
