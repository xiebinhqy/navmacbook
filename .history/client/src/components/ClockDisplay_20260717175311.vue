<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';

const settingsStore = useSettingsStore();

const currentTime = ref('00:00:00');
let timer: ReturnType<typeof setInterval> | null = null;

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds}`;
}

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div
    v-if="settingsStore.showSettingsPanel === false && settingsStore.settings.showClock"
    class="clock-display"
    :style="{ color: settingsStore.clockColor }"
  >
    {{ currentTime }}
  </div>
</template>

<style scoped>
.clock-display {
  font-size: 48px;
  font-weight: 300;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
}
</style>