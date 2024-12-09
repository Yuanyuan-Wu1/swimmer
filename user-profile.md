# 用户信息管理系统设计

## 1. 数据模型设计

### 1.1 用户基本信息表
```sql
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(100),
    gender ENUM('M', 'F', 'OTHER'),
    birth_date DATE,
    contact_email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 1.2 隐私设置表
```sql
CREATE TABLE privacy_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    field_name VARCHAR(50),  -- 对应字段名
    visibility ENUM('PUBLIC', 'FRIENDS', 'PRIVATE') DEFAULT 'PRIVATE',
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 1.3 训练记录表
```sql
CREATE TABLE training_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    training_date DATE,
    duration INT,  -- 训练时长（分钟）
    distance FLOAT,  -- 训练距离
    notes TEXT,
    visibility ENUM('PUBLIC', 'FRIENDS', 'PRIVATE') DEFAULT 'PRIVATE',
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 2. API接口设计

### 2.1 个人资料管理
```
# 获取个人资料
GET /api/v1/profile

# 更新个人资料
PUT /api/v1/profile
{
    "name": "string",
    "gender": "string",
    "birthDate": "date",
    "contactEmail": "string",
    "phone": "string"
}
```

### 2.2 隐私设置
```
# 获取隐私设置
GET /api/v1/privacy-settings

# 更新隐私设置
PUT /api/v1/privacy-settings
{
    "fieldName": "string",
    "visibility": "PUBLIC|FRIENDS|PRIVATE"
}
```

### 2.3 训练记录
```
# 添加训练记录
POST /api/v1/training-records
{
    "trainingDate": "date",
    "duration": "number",
    "distance": "number",
    "notes": "string",
    "visibility": "PUBLIC|FRIENDS|PRIVATE"
}

# 获取训练记录列表
GET /api/v1/training-records
```

## 3. 权限控制实现

### 3.1 基本规则
- 所有者完全控制
- 好友可见（如果设置为FRIENDS）
- 公开可见（如果设置为PUBLIC）

### 3.2 权限检查流程
```java
@PreAuthorize("@securityService.hasAccessToProfile(#userId)")
public ProfileDTO getProfile(Long userId) {
    // 获取用户资料
    Profile profile = profileRepository.findByUserId(userId);
    
    // 根据权限过滤字段
    return filterProfileByPermission(profile);
}
```

## 4. 实现建议

### 4.1 第一阶段实现
- 基本个人资料管理
- 简单的公开/私密设置
- 基础训练记录

### 4.2 第二阶段增强
- 细粒度的隐私控制
- 好友系统
- 高级数据统计

### 4.3 第三阶段优化
- 缓存机制
- 数据导出
- 批量操作

## 5. 安全考虑

### 5.1 数据安全
- 敏感信息加密存储
- HTTPS传输
- SQL注入防护

### 5.2 访问控制
- 基于角色的访问控制
- API访问频率限制
- 会话管理
