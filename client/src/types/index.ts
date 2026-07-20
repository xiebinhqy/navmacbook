/**
 * 书签类型定义
 */
export interface Bookmark {
  id: string;
  name: string;
  url: string;
  favicon_url?: string;
  category: string;
  sort_order: number;
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

/**
 * 用户类型定义
 */
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 用户登录信息
 */
export interface LoginData {
  username: string;
  password: string;
}

/**
 * 用户注册信息
 */
export interface RegisterData {
  username: string;
  password: string;
  email?: string;
}

/**
 * 认证响应
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * 用户设置
 */
export interface UserSettings {
  // 时间设置
  showClock: boolean;
  clockColor: string;
  
  // 搜索设置
  enableSearch: boolean;
  enableSearchSuggestion: boolean;
  enableSearchHistory: boolean;
  
  // 图标设置
  iconSize: number;
  iconBorderRadius: number;
  
  // 壁纸设置
  wallpaperUrl: string;
  wallpaperMode: 'cover' | 'contain' | 'center';
  
  // 主题设置
  theme: 'light' | 'dark';
  
  // 每页数量
  itemsPerPage: number;
}

/**
 * 默认设置
 */
export const defaultSettings: UserSettings = {
  showClock: true,
  clockColor: '#ffffff',
  enableSearch: true,
  enableSearchSuggestion: true,
  enableSearchHistory: true,
  iconSize: 64,
  iconBorderRadius: 12,
  wallpaperUrl: '',
  wallpaperMode: 'cover',
  theme: 'dark',
  itemsPerPage: 30,
};

/**
 * API 响应
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 分页信息
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 搜索引擎
 */
export interface SearchEngine {
  name: string;
  url: string;
  icon: string;
  default?: boolean;
}

/**
 * 预设搜索引擎列表
 */
export const searchEngines: SearchEngine[] = [
  { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'google', default: true },
  { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'bing' },
  { name: '百度', url: 'https://www.baidu.com/s?wd=', icon: 'baidu' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'duckduckgo' },
  { name: '360搜索', url: 'https://www.so.com/s?q=', icon: '360' },
];