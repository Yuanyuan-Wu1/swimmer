# 用户认证系统技术设计文档

## 1. 系统架构

### 1.1 核心组件
- 认证服务（Authentication Service）
- 用户服务（User Service）
- 通知服务（Notification Service）
- 安全服务（Security Service）

### 1.2 外部依赖
- 邮件服务: Amazon SES
- 短信服务: Twilio
- 社交登录: Auth0
- 缓存系统: Redis
- 数据库: PostgreSQL

## 2. 详细设计

### 2.1 电子邮件注册流程
```
1. 用户提交注册信息
2. 后端验证邮箱格式
3. 生成验证码并存入Redis（15分钟有效期）
4. 通过队列异步发送验证邮件
5. 用户点击验证链接完成注册
```

### 2.2 社交媒体登录流程
```
1. 用户选择社交平台登录
2. 重定向到社交平台授权页
3. 获取授权码和用户信息
4. 创建或关联本地用户账号
5. 生成JWT令牌返回
```

### 2.3 手机验证流程
```
1. 用户输入手机号
2. 服务端验证号码格式
3. 生成6位随机验证码
4. 通过Twilio发送短信
5. 用户输入验证码验证
```

## 3. 安全措施

### 3.1 防护机制
- IP限流：每IP每小时最多5次请求
- 验证码有效期：15分钟
- 密码策略：至少8位，包含大小写字母和数字
- 会话管理：JWT + Refresh Token

### 3.2 风控策略
- 异常登录检测
- 账号安全等级
- 登录行为分析
- 防暴力破解

## 4. 数据模型

### 4.1 用户表（Users）
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    status VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 4.2 社交账号关联表（SocialAccounts）
```sql
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    provider VARCHAR(20),
    provider_user_id VARCHAR(255),
    created_at TIMESTAMP
);
```

## 5. API接口

### 5.1 注册接口
```
POST /api/v1/auth/register
{
    "email": "string",
    "password": "string",
    "phone": "string"
}
```

### 5.2 登录接口
```
POST /api/v1/auth/login
{
    "username": "string",
    "password": "string",
    "type": "email|phone|social"
}
```

### 5.3 验证接口
```
POST /api/v1/auth/verify
{
    "type": "email|phone",
    "code": "string"
}
```

## 6. 监控指标

### 6.1 性能指标
- 注册成功率
- 登录响应时间
- 验证码发送成功率
- API错误率

### 6.2 安全指标
- 异常登录次数
- 验证码尝试失败次数
- 账号锁定次数
- 社交登录转化率
