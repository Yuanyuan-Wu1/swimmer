# 简化版用户认证系统设计

## 1. 功能范围

### 1.1 基础功能
- 邮箱注册
- 邮箱登录
- 密码重置
- 登出功能

### 1.2 不包含的功能
- 社交媒体登录
- 手机号验证
- 多因素认证

## 2. 技术方案

### 2.1 技术选择
- 后端框架: Spring Boot
- 数据库: MySQL
- 缓存: Redis
- JWT认证

### 2.2 数据模型

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'INACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 3. API接口

### 3.1 注册
```
POST /api/v1/auth/register
Request:
{
    "email": "string",
    "password": "string"
}
Response:
{
    "success": true,
    "message": "Registration successful"
}
```

### 3.2 登录
```
POST /api/v1/auth/login
Request:
{
    "email": "string",
    "password": "string"
}
Response:
{
    "token": "JWT_TOKEN",
    "expiresIn": 3600
}
```

### 3.3 登出
```
POST /api/v1/auth/logout
Header:
Authorization: Bearer JWT_TOKEN
Response:
{
    "success": true,
    "message": "Logout successful"
}
```

## 4. 安全措施

### 4.1 基本安全
- 密码加密存储 (BCrypt)
- JWT令牌认证
- 登录尝试次数限制 (1小时内最多5次)
- HTTPS传输

### 4.2 密码策略
- 最小长度：8位
- 必须包含字母和数字
- 不允许常见密码

## 5. 错误处理

### 5.1 常见错误码
- 400: 请求参数错误
- 401: 未授权
- 403: 禁止访问
- 409: 邮箱已存在
- 429: 请求过于频繁

## 6. 部署要求

### 6.1 环境要求
- JDK 17+
- MySQL 8.0+
- Redis 6.0+

### 6.2 配置项
- JWT密钥
- 数据库连接
- Redis连接
- 邮件服务器

## 7. 后续扩展计划

### 7.1 第二阶段（视需求）
- 添加社交媒体登录
- 实现手机号验证
- 增加管理员角色

### 7.2 第三阶段（视需求）
- 多因素认证
- 单点登录
- 细粒度权限控制
