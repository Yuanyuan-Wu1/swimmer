# 简化版JWT认证授权系统设计

## 1. 系统功能

### 1.1 保留的核心功能
- JWT基础认证
- 简单的角色控制（用户/管理员两种角色）
- 基本的会话管理
- 简单的令牌刷新

### 1.2 暂不实现的功能
- OAuth2.0集成
- 复杂的RBAC权限控制
- 详细的审计日志
- 多设备登录控制

## 2. 数据模型

### 2.1 用户角色表（简化版）
```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL  -- 'USER' 或 'ADMIN'
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);
```

### 2.2 令牌记录表
```sql
CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 3. JWT配置

### 3.1 Token设置
```java
public class JwtConfig {
    private String secret = "your-secret-key";
    private long accessTokenExpiration = 3600000; // 1小时
    private long refreshTokenExpiration = 86400000; // 24小时
}
```

## 4. API接口

### 4.1 认证接口
```
# 登录
POST /api/v1/auth/login
Request:
{
    "email": "string",
    "password": "string"
}
Response:
{
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": number
}

# 刷新令牌
POST /api/v1/auth/refresh
Request:
{
    "refreshToken": "string"
}
Response:
{
    "accessToken": "string",
    "expiresIn": number
}
```

## 5. 实现流程

### 5.1 登录流程
```java
@PostMapping("/login")
public JwtResponse login(@RequestBody LoginRequest request) {
    // 1. 验证用户凭据
    Authentication auth = authManager.authenticate(request);
    
    // 2. 生成JWT令牌
    String accessToken = jwtUtil.generateToken(auth);
    
    // 3. 生成刷新令牌
    String refreshToken = jwtUtil.generateRefreshToken(auth);
    
    return new JwtResponse(accessToken, refreshToken);
}
```

### 5.2 权限检查
```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin")
public String adminOnly() {
    return "仅管理员可访问";
}
```

## 6. 安全措施

### 6.1 基本安全配置
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf().disable()
            .authorizeRequests()
            .antMatchers("/api/v1/auth/**").permitAll()
            .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

## 7. 错误处理

### 7.1 常见错误
- Token过期
- Token无效
- 权限不足
- 刷新令牌失效

## 8. 后续优化（可选）

### 8.1 性能优化
- Token黑名单
- 缓存用户权限
- 批量刷新处理

### 8.2 安全增强
- Token轮换
- 设备指纹
- 登录异常检测
