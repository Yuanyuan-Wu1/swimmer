describe('API Integration Tests', () => {
  test('Authentication Flow', async () => {
    // 测试登录流程
    const loginResponse = await api.auth.login(credentials);
    expect(loginResponse.token).toBeDefined();
    
    // 测试token持久化
    const token = localStorage.getItem('token');
    expect(token).toBe(loginResponse.token);
  });
}); 