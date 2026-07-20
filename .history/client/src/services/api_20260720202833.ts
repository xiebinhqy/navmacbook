import axios from 'axios';
import type { Bookmark } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// 请求拦截器：添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nav_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理 401 未授权
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nav_token');
      localStorage.removeItem('nav_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const bookmarkApi = {
  getAll: () => api.get<Bookmark[]>('/bookmarks'),
  get: (id: string) => api.get<Bookmark>(`/bookmarks/${id}`),
  create: (data: Partial<Bookmark>) => api.post<Bookmark>('/bookmarks', data),
  update: (id: string, data: Partial<Bookmark>) => api.put<Bookmark>(`/bookmarks/${id}`, data),
  delete: (id: string) => api.delete(`/bookmarks/${id}`),
};

export const settingsApi = {
  get: () => api.get<Record<string, unknown>>('/settings'),
  update: (data: Record<string, unknown>) => api.put<Record<string, unknown>>('/settings', data),
};

export const userApi = {
  getCurrent: () => api.get<Record<string, unknown>>('/user/me'),
  login: (data: { username: string; password: string }) => api.post('/auth/login', data),
  register: (data: { username: string; password: string; email?: string }) => api.post('/auth/register', data),
};

export default api;