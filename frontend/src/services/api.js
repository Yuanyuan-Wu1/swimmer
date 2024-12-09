import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const performanceApi = {
  getPerformances: async (event) => {
    const response = await api.get(`/performance/performances/${event}`);
    return response.data;
  },
  addPerformance: async (data) => {
    const response = await api.post('/performance/performances', data);
    return response.data;
  },
  updatePerformance: (id, data) => api.put(`/performance/performances/${id}`, data),
  deletePerformance: (id) => api.delete(`/performance/performances/${id}`),
};

export const medalApi = {
  getMedals: async () => {
    const response = await api.get('/medal/medals');
    return response.data;
  },
  addMedal: (data) => api.post('/medal/medals', data),
  updateMedal: (id, data) => api.put(`/medal/medals/${id}`, data),
  deleteMedal: (id) => api.delete(`/medal/medals/${id}`),
};

export const trainingApi = {
  getActivePlan: async () => {
    const response = await api.get('/training-plan/active');
    return response.data;
  },
  generatePlan: (data) => api.post('/training-plan/generate', data),
  updatePlan: (id, data) => api.put(`/training-plan/${id}`, data),
  deletePlan: (id) => api.delete(`/training-plan/${id}`),
  createPlan: async (planData) => {
    const response = await api.post('/training-plan/create', planData);
    return response.data;
  }
};

export const dashboardApi = {
  getRecentPerformances: async () => {
    const response = await api.get('/performance/recent');
    return response.data;
  },
  getUpcomingEvents: async () => {
    const response = await api.get('/events/upcoming');
    return response.data;
  },
  getMedalSummary: async () => {
    const response = await api.get('/medal/summary');
    return response.data;
  },
  getTrainingProgress: async () => {
    const response = await api.get('/training/progress');
    return response.data;
  },
  getFinaPoints: async () => {
    const response = await api.get('/performance/fina-points');
    return response.data;
  }
};

export default api;
