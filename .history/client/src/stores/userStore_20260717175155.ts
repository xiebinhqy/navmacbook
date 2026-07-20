import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, AuthResponse } from '../types';

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
    updateProfile,
  };
});