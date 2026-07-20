<script setup lang="ts">
import { useSettingsStore } from './stores/settingsStore';
import { onMounted, watch } from 'vue';

const settingsStore = useSettingsStore();

// 初始化主题
onMounted(() => {
  document.body.className = settingsStore.settings.theme;
});

// 监听主题变化
watch(() => settingsStore.settings.theme, (newTheme) => {
  document.body.className = newTheme;
});
</script>

<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}

body.dark {
  background: #0d1117;
  color: #fff;
}

body.light {
  background: #f5f5f5;
  color: #000;
}
</style>