<script setup lang="ts">
import { useSettingsStore } from './stores/settingsStore';
import { onMounted } from 'vue';

const settingsStore = useSettingsStore();

onMounted(() => {
  document.body.className = settingsStore.settings.theme;
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