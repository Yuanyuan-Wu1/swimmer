const axios = require('axios');
const puppeteer = require('puppeteer');

class WestTeamAuthService {
  constructor() {
    this.baseUrl = 'https://www.westswimteam.com';
    this.headers = {
      'x-rio-client': 'JS',
      'x-rio-entry': 'coreService.loadClientModuleData',
      'x-tu-team': 'pnswca',
      'x-rio-client-timezone': 'America/Los_Angeles',
      'Content-Type': 'application/json'
    };
  }

  // 修改登录方法
  async login() {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/coreService/loadClientModuleData`,
        {},
        {
          headers: this.headers,
          withCredentials: true // 保持cookie
        }
      );

      // 从响应头中获取cookie
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        this.cookies = cookies.map(cookie => cookie.split(';')[0]).join('; ');
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // 修改获取比赛数据的方法
  async getMeetResults() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/meet-results`,
        {
          headers: {
            ...this.headers,
            'Cookie': this.cookies
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting meet results:', error);
      throw error;
    }
  }

  // 修改网络分析方法
  async getApiKeyFromNetwork() {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true
    });

    try {
      const page = await browser.newPage();

      // 设置请求拦截
      await page.setRequestInterception(true);
      page.on('request', request => {
        // 添加必要的请求头
        const headers = {
          ...request.headers(),
          'x-rio-client': 'JS',
          'x-rio-entry': 'coreService.loadClientModuleData',
          'x-tu-team': 'pnswca'
        };
        request.continue({ headers });
      });

      // 监听响应
      page.on('response', async response => {
        const url = response.url();
        if (url.includes('/api/coreService/loadClientModuleData')) {
          console.log('\nFound core service response:');
          const headers = response.headers();
          console.log('Response headers:', headers);
          
          // 保存所有cookie
          const cookies = headers['set-cookie'];
          if (cookies) {
            console.log('Cookies found:', cookies);
          }

          try {
            const data = await response.json();
            console.log('Response data:', data);
          } catch (e) {}
        }
      });

      // 访问页面
      await page.goto('https://www.westswimteam.com/controller/cms/admin/index');
      
      // 等待API请求完成
      await page.waitForResponse(
        response => response.url().includes('/api/coreService/loadClientModuleData')
      );

      // 获取所有cookie
      const cookies = await page.cookies();
      console.log('\nAll cookies:', cookies);

      // 构建认证信息
      const authInfo = {
        cookies: cookies.map(c => `${c.name}=${c.value}`).join('; '),
        headers: this.headers
      };

      return authInfo;
    } catch (error) {
      console.error('Network analysis error:', error);
      throw error;
    }
  }
}

module.exports = new WestTeamAuthService(); 