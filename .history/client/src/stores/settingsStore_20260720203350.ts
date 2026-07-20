import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserSettings } from '../types';
import { defaultSettings } from '../types';

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<UserSettings>({ ...defaultSettings });
  const showSettingsPanel = ref(false);
  const settingsTab = ref('basic');

  // Getters
  const currentTheme = computed(() => settings.value.theme);
  const isDarkMode = computed(() => settings.value.theme === 'dark');
  const clockColor = computed(() => settings.value.clockColor);
  const iconSize = computed(() => settings.value.iconSize);
  const iconBorderRadius = computed(() => settings.value.iconBorderRadius);

  // Actions
  function initFromStorage() {
    const stored = localStorage.getItem('nav_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        settings.value = { ...defaultSettings, ...parsed };
      } catch {
        localStorage.setItem('nav_settings', JSON.stringify(defaultSettings));
      }
    } else {
      localStorage.setItem('nav_settings', JSON.stringify(defaultSettings));
    }
  }

  function updateSettings(updates: Partial<UserSettings>) {
    settings.value = { ...settings.value, ...updates };
    localStorage.setItem('nav_settings', JSON.stringify(settings.value));
  }

  // 监听 settings 变化自动持久化
  watch(settings, (newVal) => {
    localStorage.setItem('nav_settings', JSON.stringify(newVal));
  }, { deep: true });

  function resetSettings() {
    settings.value = { ...defaultSettings };
    localStorage.setItem('nav_settings', JSON.stringify(defaultSettings));
  }

  function toggleSettingsPanel() {
    showSettingsPanel.value = !showSettingsPanel.value;
  }

  function openSettingsPanel(tab?: string) {
    if (tab) {
      settingsTab.value = tab;
    }
    showSettingsPanel.value = true;
  }

  function closeSettingsPanel() {
    showSettingsPanel.value = false;
  }

  function setSettingsTab(tab: string) {
    settingsTab.value = tab;
  }

  return {
    settings,
    showSettingsPanel,
    settingsTab,
    currentTheme,
    isDarkMode,
    clockColor,
    iconSize,
    iconBorderRadius,
    initFromStorage,
    updateSettings,
    resetSettings,
    toggleSettingsPanel,
    openSettingsPanel,
    closeSettingsPanel,
    setSettingsTab,
  };
});