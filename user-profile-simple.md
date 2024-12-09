# 简化版用户信息管理系统设计

## 1. 功能范围

### 1.1 保留的功能
- 基本个人资料管理（姓名、性别、出生日期）
- 简单的训练记录（日期、时长、距离）
- 基础的成绩记录（比赛日期、项目、成绩）

### 1.2 暂不实现的功能
- 复杂的隐私设置
- 详细的训练分析
- 数据导出功能
- 权限管理系统

## 2. 数据模型设计

### 2.1 用户基本信息表
```sql
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(100),
    gender ENUM('M', 'F', 'OTHER'),
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2.2 训练记录表（简化版）
```sql
CREATE TABLE training_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    training_date DATE,
    duration INT,  -- 训练时长（分钟）
    distance FLOAT,  -- 训练距离
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2.3 比赛成绩表（简化版）
```sql
CREATE TABLE competition_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    competition_date DATE,
    event_name VARCHAR(100),  -- 比赛项目
    result_time INT,  -- 成绩（秒）
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 3. API接口设计

### 3.1 个人资料管理
```
# 获取个人资料
GET /api/v1/profile

# 更新个人资料
PUT /api/v1/profile
{
    "name": "string",
    "gender": "string",
    "birthDate": "date"
}
```

### 3.2 训练记录
```
# 添加训练记录
POST /api/v1/training-records
{
    "trainingDate": "date",
    "duration": "number",
    "distance": "number",
    "notes": "string"
}

# 获取训练记录列表
GET /api/v1/training-records
```

### 3.3 比赛成绩
```
# 添加比赛成绩
POST /api/v1/competition-results
{
    "competitionDate": "date",
    "eventName": "string",
    "resultTime": "number"
}

# 获取成绩列表
GET /api/v1/competition-results
```

## 4. 实现建议

### 4.1 前端实现
- 使用简单的表单收集数据
- 基础的数据展示表格
- 简单的数据验证

### 4.2 后端实现
- 基本的CRUD操作
- 简单的数据验证
- 基础的错误处理

### 4.3 安全措施
- 基本的用户认证
- 简单的数据验证
- HTTPS传输

## 5. 后续扩展计划

### 5.1 可选功能（视需求添加）
- 训练记录统计
- 成绩趋势图
- 简单的数据导出

### 5.2 性能优化（按需实施）
- 添加基础缓存
- 分页查询
- 简单的数据索引
