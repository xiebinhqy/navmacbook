<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  total: number;
  currentPage: number;
  pageSize: number;
}>();

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
}>();

const totalPages = computed(() => Math.ceil(props.total / props.pageSize));

const displayPages = computed(() => {
  const pages: (number | string)[] = [];
  const current = props.currentPage;
  
  if (totalPages.value <= 7) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages.value - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < totalPages.value - 2) pages.push('...');
    pages.push(totalPages.value);
  }
  
  return pages;
});

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page);
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <button 
      class="page-btn" 
      :disabled="currentPage === 1" 
      @click="goToPage(currentPage - 1)"
    >
      ←
    </button>
    
    <template v-for="(page, index) in displayPages" :key="index">
      <span v-if="page === '...'" class="page-dots">...</span>
      <button 
        v-else 
        class="page-btn"
        :class="{ active: page === currentPage }"
        @click="goToPage(page as number)"
      >
        {{ page }}
      </button>
    </template>
    
    <button 
      class="page-btn" 
      :disabled="currentPage === totalPages" 
      @click="goToPage(currentPage + 1)"
    >
      →
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 20px;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color, rgba(255,255,255,0.2));
  background: transparent;
  color: var(--text-primary, #fff);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: rgba(255,255,255,0.1);
}

.page-btn.active {
  background: var(--primary-color, #646cff);
  border-color: var(--primary-color, #646cff);
  color: #fff;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-dots {
  padding: 6px 8px;
  color: var(--text-secondary, #888);
}
</style>