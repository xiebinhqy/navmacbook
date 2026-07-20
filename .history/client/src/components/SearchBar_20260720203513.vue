<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';
import { useBookmarkStore } from '../stores/bookmarkStore';

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'search', value: string): void;
}>();

const settingsStore = useSettingsStore();
const bookmarkStore = useBookmarkStore();
const searchText = ref(props.modelValue || '');
const searchHistory = ref<string[]>([]);
const showSuggestions = ref(false);
const suggestions = ref<string[]>([]);

// 监听 props 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) {
    searchText.value = newVal;
  }
});

// 监听搜索文本变化，显示书签搜索词联想
watch(searchText, (newVal) => {
  if (!newVal || !newVal.trim() || !settingsStore.settings.enableSearchSuggestion) {
    suggestions.value = [];
    return;
  }
  
  // 从书签中搜索匹配的名称或URL
  const query = newVal.toLowerCase();
  const allBookmarks = bookmarkStore.bookmarks;
  const matched = allBookmarks
    .filter(b => b.name.toLowerCase().includes(query) || b.url.toLowerCase().includes(query))
    .map(b => b.name)
    .slice(0, 5);
  
  suggestions.value = matched;
});

function loadSearchHistory() {
  const stored = localStorage.getItem('nav_search_history');
  if (stored) {
    searchHistory.value = JSON.parse(stored);
  }
}

loadSearchHistory();

function saveToHistory() {
  if (!searchText.value.trim() || !settingsStore.settings.enableSearchHistory) return;
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
    showSuggestions.value = false;
    emit('search', searchText.value.trim());
  }
}

function clearSearch() {
  searchText.value = '';
  showSuggestions.value = false;
  emit('update:modelValue', '');
}

function selectHistory(term: string) {
  searchText.value = term;
  showSuggestions.value = false;
  emit('update:modelValue', term);
  emit('search', term);
}

function selectSuggestion(term: string) {
  searchText.value = term;
  showSuggestions.value = false;
  emit('update:modelValue', term);
  emit('search', term);
}

function clearHistory() {
  searchHistory.value = [];
  localStorage.removeItem('nav_search_history');
}

function handleFocus() {
  if (settingsStore.settings.enableSearchHistory && searchHistory.value.length > 0) {
    showSuggestions.value = true;
  }
}

function handleBlur() {
  // 延迟关闭以允许点击历史记录项
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
}
</script>

<template>
  <div v-if="settingsStore.settings.enableSearch" class="search-container">
    <div class="search-wrapper">
      <input
        v-model="searchText"
        type="text"
        placeholder="搜索书签或输入网址..."
        class="search-input"
        @keyup.enter="handleSearch"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <button v-if="searchText" class="clear-btn" @click="clearSearch">×</button>
      <button class="search-btn" @click="handleSearch">🔍</button>
      
      <!-- 搜索建议下拉 -->
      <div v-if="showSuggestions && (searchHistory.length > 0 || suggestions.length > 0)" class="suggestions-dropdown">
        <!-- 书签搜索词联想 -->
        <div v-if="suggestions.length > 0" class="suggestion-group">
          <div class="suggestion-title">书签</div>
          <div 
            v-for="(term, index) in suggestions" 
            :key="'sug-' + index"
            class="suggestion-item"
            @click="selectSuggestion(term)"
          >
            🔖 {{ term }}
          </div>
        </div>
        
        <!-- 搜索历史 -->
        <div v-if="searchHistory.length > 0" class="suggestion-group">
          <div class="suggestion-title">历史</div>
          <div 
            v-for="(term, index) in searchHistory.slice(0, 5)" 
            :key="'hist-' + index"
            class="suggestion-item"
            @click="selectHistory(term)"
          >
            🕐 {{ term }}
          </div>
          <div class="suggestion-item clear-history" @click="clearHistory">
            🗑️ 清空历史
          </div>
        </div>
      </div>
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
  position: relative;
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

.clear-btn:hover,
.search-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--bg-secondary, #1e1e1e);
  border: 1px solid var(--border-color, rgba(255,255,255,0.1));
  border-radius: 12px;
  padding: 12px;
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.suggestion-group {
  margin-bottom: 12px;
}

.suggestion-group:last-child {
  margin-bottom: 0;
}

.suggestion-title {
  font-size: 12px;
  color: var(--text-secondary, #888);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.suggestion-item {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-primary, #fff);
  font-size: 14px;
  transition: background 0.2s;
}

.suggestion-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.suggestion-item.clear-history {
  color: #ff6b6b;
}

.suggestion-item.clear-history:hover {
  background: rgba(255, 107, 107, 0.1);
}
</style>
