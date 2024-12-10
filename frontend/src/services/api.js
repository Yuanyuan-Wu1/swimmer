import axios from 'axios';

// 添加重试机制
const createApiWithRetry = (baseConfig) => {
  const instance = axios.create(baseConfig);
  
  instance.interceptors.response.use(
    response => response,
    async error => {
      const config = error.config;
      
      // 如果没有设置重试次数或者已经重试过了，就直接返回错误
      if (!config || !config.retry || config.__retryCount >= config.retry) {
        return Promise.reject(error);
      }
      
      // 增加重试次数
      config.__retryCount = config.__retryCount || 0;
      config.__retryCount += 1;
      
      // 延迟重试
      const backoff = new Promise(resolve => {
        setTimeout(() => resolve(), config.retryDelay || 1000);
      });
      
      // 重试请求
      await backoff;
      return instance(config);
    }
  );
  
  return instance;
};

const api = createApiWithRetry({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  withCredentials: true,
  retry: 3,
  retryDelay: 1000
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 添加token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 添加CORS相关头
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      // 服务器返回错误
      console.error('Server error:', error.response.data);
      if (error.response.status === 401) {
        // 未授权，清除token并重定向到登录页
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('Network error:', error.request);
    } else {
      // 请求配置出错
      console.error('Request config error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API服务���象
const apiService = {
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me')
  },
  performance: {
    getAll: (filters) => api.get('/performances', { params: filters }),
    add: (data) => api.post('/performances', data),
    update: (id, data) => api.put(`/performances/${id}`, data),
    delete: (id) => api.delete(`/performances/${id}`)
  },
  medals: {
    getAll: async () => {
      try {
        const response = await api.get('/medals');
        return {
          data: response.data.map(medal => ({
            id: medal.id,
            type: medal.type || 'standard',
            level: medal.level,
            achieved: medal.achieved || false,
            date: medal.date
          }))
        };
      } catch (error) {
        console.error('Error fetching medals:', error);
        return { data: [] };
      }
    },
    getById: (id) => api.get(`/medals/${id}`)
  },
  standards: {
    getMotivational: () => api.get('/standards/motivational'),
    getChamps: () => api.get('/standards/champs')
  },
  health: {
    getRecent: () => api.get('/health/recent'),
    getTrends: () => api.get('/health/trends'),
    getRecommendations: () => api.get('/health/recommendations')
  },
  team: {
    getAnnouncements: () => api.get('/team/announcements'),
    getMessages: () => api.get('/team/messages'),
    getMembers: () => api.get('/team/members')
  },
  activity: {
    getRecent: () => api.get('/activities/recent')
  },
  competition: {
    getUpcoming: () => api.get('/competitions/upcoming')
  }
};

// 导出API服务
export { apiService };
export const authApi = apiService.auth;
export const performanceApi = apiService.performance;
export const medalApi = apiService.medals;
export const standardsApi = apiService.standards;
export const healthApi = apiService.health;
export const teamApi = apiService.team;
export const activityApi = apiService.activity;
export const competitionApi = apiService.competition;
export const champsStandardsApi = apiService.standards;

export default api;
