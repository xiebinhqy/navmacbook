import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, AuthResponse } from '../types';
import { userApi } from '../services/api';

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => !!token.value);

  // Actions
  function setUser(authData: AuthResponse) {
    user.value = authData.user;
    token.value = authData.token;
    localStorage.setItem('nav_token', authData.token);
    localStorage.setItem('nav_user', JSON.stringify(authData.user));
  }

  function loadFromStorage() {
    const storedToken = localStorage.getItem('nav_token');
    const storedUser = localStorage.getItem('nav_user');
    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('nav_token');
    localStorage.removeItem('nav_user');
  }

  async function login(username: string, password: string) {
    const res = await userApi.login({ username, password });
    setUser(res.data);
    return res.data;
  }

  async function register(username: string, password: string, email?: string) {
    const res = await userApi.register({ username, password, email });
    setUser(res.data);
    return res.data;
  }

  function updateProfile(updates: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...updates };
      localStorage.setItem('nav_user', JSON.stringify(user.value));
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    loadFromStorage,
    logout,
    login,
    register,
    updateProfile,
  };
});