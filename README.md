# Swimmer Performance Tracking System

## 功能特点

- 多来源数据同步 (SwimCloud, West Team)
- 标准时间对比 (USA Swimming Motivational Times)
- 锦标赛资格追踪 (PNS Championships)
- 成绩可视化分析
- 勋章成就系统

## 技术栈

### 前端
- React 18
- Material-UI
- Recharts
- Axios
- Context API

### 后端
- Node.js
- Express
- MongoDB
- JWT认证
- PDF解析

## 项目结构

```
project/
├── backend/
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── services/      # 业务服务
│   │   ├── routes/        # API路由
│   │   └── config/        # 配置文件
│   └── data/             # 标准时间数据
├── frontend/
│   ├── src/
│   │   ├── components/    # UI组件
│   │   ├── services/      # API服务
│   │   ├── contexts/      # 上下文
│   │   └── utils/         # 工具函数
│   └── public/
└── scripts/              # 数据处理脚本
```

## 安装与运行

1. 安装依赖
```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd frontend
npm install
```

2. 配置环境变量
```bash
# backend/.env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# frontend/.env
REACT_APP_API_URL=http://localhost:5000
```

3. 处理标准时间数据
```bash
cd scripts
python process_standards.py
```

4. 启动服务
```bash
# 后端服务
cd backend
npm run dev

# 前端服务
cd frontend
npm start
```

## API文档

### 标准时间API
- GET /api/standards/motivational
- GET /api/standards/champs
- GET /api/standards/event/:eventId

### 成绩API
- GET /api/performances
- POST /api/performances
- GET /api/performances/summary

### 勋章API
- GET /api/medals/user
- POST /api/medals/check/:performanceId

## 数据同步

1. 从SwimCloud同步
```bash
npm run sync:swimcloud
```

2. 从West Team同步
```bash
npm run sync:westteam
```

## 开发指南

1. 添加新的标准时间
- 更新 process_standards.py
- 运行数据处理脚本
- 更新相关服务和API

2. 添加新的数据源
- 实现数据源API客户端
- 添加同步服务
- 更新数据模型

3. 添加新的勋章类型
- 更新勋章模型
- 实现检测逻辑
- 添加前端展示

## 测试

```bash
# 运行后端测试
cd backend
npm test

# 运行前端测试
cd frontend
npm test
```

## 部署

1. 构建前端
```bash
cd frontend
npm run build
```

2. 配置生产环境
- 设置环境变量
- 配置数据库
- 设置反向代理

3. 启动服务
```bash
cd backend
npm start
```
 1. 安装 Xcode Command Line Tools
xcode-select --install

# 2. 安装 Homebrew (macOS包管理器)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. 安装 Node.js
brew install node

# 4. 安装 MongoDB
brew tap mongodb/brew
brew install mongodb-community
# 1. 克隆项目
git clone https://github.com/Yuanyuan-Wu1/swimmer.git
cd swimmer

# 2. 安装后端依赖
cd backend
npm install

# 3. 创建 .env 文件
echo "MONGODB_URI=mongodb://localhost:27017/swimmer
JWT_SECRET=your_secret_key
PORT=5000" > .env

# 4. 安装前端依赖
cd ../frontend
npm install

# 1. 启动 MongoDB
brew services start mongodb-community

# 2. 启动后端服务器 (在 backend 目录下)
cd ../backend
npm run dev

# 3. 启动前端开发服务器 (新开一个终端,在 frontend 目录下)
cd ../frontend
npm start

# 1. 配置 Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 2. 添加修改
git add .

# 3. 提交修改
git commit -m "Add nutrition and health reminder features"

# 4. 推送到远程仓库
git push origin master
# 1. 创建新分支进行开发
git checkout -b feature/nutrition-module

# 2. 进行代码修改...

# 3. 提交修改
git add .
git commit -m "Add nutrition tracking features"

# 4. 推送分支
git push origin feature/nutrition-module

# 5. 在 GitHub 上创建 Pull Request
# 后端开发
cd backend
npm run dev      # 启动开发服务器
npm test        # 运行测试
npm run lint    # 代码检查

# 前端开发
cd frontend
npm start       # 启动开发服务器
npm test        # 运行测试
npm run build   # 构建生产版本

# 检查MongoDB日志
tail -f /usr/local/var/log/mongodb/mongo.log

# 确保数据目录存在
mkdir -p ~/data/db
# 查看占用端口的进程
lsof -i :5000
lsof -i :3000

# 终止进程
kill -9 <PID>
# 修复权限
sudo chown -R `whoami` ~/.npm
sudo chown -R `whoami` /usr/local/lib/node_modules
# backend/.env
echo "NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/swimmer
JWT_SECRET=1cvYzJYRWRkaWGfQp6E2eV9r6Mkf+DE22mBbesAoHzI=
PORT=5000
USE_MOCK_DATA=true" > .env

# frontend/.env
echo "REACT_APP_API_URL=http://localhost:5000/api" > frontend/.env