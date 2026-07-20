<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'search', value: string): void;
}>();

const settingsStore = useSettingsStore();
const searchText = ref(props.modelValue || '');
const searchHistory = ref<string[]>([]);
const showSuggestions = ref(false);

function loadSearchHistory() {
  const stored = localStorage.getItem('nav_search_history');
  if (stored) {
    searchHistory.value = JSON.parse(stored);
  }
}

loadSearchHistory();

function saveToHistory() {
  if (!searchText.value.trim()) return;
  const term = searchText.value.trim();
  const index = searchHistory.value.indexOf(term);
  if (index > -1) {
    searchHistory.value.splice(index, 1);
  }
  searchHistory.value.unshift(term);
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10);
  }
  localStorage.setItem('nav_search_history', JSON.stringify(searchHistory.value));
}

function handleSearch() {
  if (searchText.value.trim()) {
    saveToHistory();
    emit('search', searchText.value.trim());
  }
}

function clearSearch() {
  searchText.value = '';
  emit('update:modelValue', '');
}

function selectHistory(term: string) {
  searchText.value = term;
  showSuggestions.value = false;
  emit('update:modelValue', term);
  emit('search', term);
}

function clearHistory() {
  searchHistory.value = [];
  localStorage.removeItem('nav_search_history');
}
</script>

<template>
  <div class="search-container">
    <div class="search-wrapper">
      <input
        v-model="searchText"
        type="text"
        placeholder="搜索书签..."
        class="search-input"
        @keyup.enter="handleSearch"
        :disabled="!settingsStore.settings.enableSearch"
      />
      <button v-if="searchText" class="clear-btn" @click="clearSearch">×</button>
      <button class="search-btn" @click="handleSearch">🔍</button>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 8px 16px;
  backdrop-filter: blur(10px);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 16px;
  padding: 8px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-btn,
.search-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}
</style>