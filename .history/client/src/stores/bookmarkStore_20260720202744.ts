import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Bookmark, PaginatedResponse } from '../types';
import { bookmarkApi } from '../services/api';

export const useBookmarkStore = defineStore('bookmark', () => {
  // State
  const bookmarks = ref<Bookmark[]>([]);
  const currentCategory = ref('all');
  const currentPage = ref(1);
  const pageSize = ref(30);
  const isLoading = ref(false);
  const total = ref(0);

  // Getters
  const categories = computed(() => {
    const cats = new Set(bookmarks.value.map(b => b.category));
    return ['all', ...Array.from(cats)];
  });

  const filteredBookmarks = computed(() => {
    let filtered = bookmarks.value;
    if (currentCategory.value !== 'all') {
      filtered = filtered.filter(b => b.category === currentCategory.value);
    }
    return filtered;
  });

  const paginatedBookmarks = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredBookmarks.value.slice(start, start + pageSize.value);
  });

  const totalPages = computed(() => {
    return Math.ceil(filteredBookmarks.value.length / pageSize.value);
  });

  const favoriteBookmarks = computed(() => {
    return bookmarks.value.filter(b => b.is_favorite === 1);
  });

  // Actions
  function setBookmarks(data: Bookmark[]) {
    bookmarks.value = data;
  }

  function setPagination(data: { total: number; page: number; pageSize: number }) {
    total.value = data.total;
    currentPage.value = data.page;
    pageSize.value = data.pageSize;
  }

  function setCurrentCategory(category: string) {
    currentCategory.value = category;
    currentPage.value = 1;
  }

  function setCurrentPage(page: number) {
    currentPage.value = page;
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function addBookmark(bookmark: Bookmark) {
    bookmarks.value.unshift(bookmark);
  }

  function updateBookmark(id: string, updates: Partial<Bookmark>) {
    const index = bookmarks.value.findIndex(b => b.id === id);
    if (index !== -1) {
      bookmarks.value[index] = { ...bookmarks.value[index], ...updates };
    }
  }

  function removeBookmark(id: string) {
    bookmarks.value = bookmarks.value.filter(b => b.id !== id);
  }

  function toggleFavorite(id: string) {
    const bookmark = bookmarks.value.find(b => b.id === id);
    if (bookmark) {
      bookmark.is_favorite = bookmark.is_favorite === 1 ? 0 : 1;
    }
  }

  // API 调用方法
  async function fetchBookmarks() {
    setLoading(true);
    try {
      const res = await bookmarkApi.getAll();
      setBookmarks(res.data);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function createBookmark(data: Partial<Bookmark>) {
    setLoading(true);
    try {
      const res = await bookmarkApi.create(data);
      addBookmark(res.data);
      return res.data;
    } catch (error) {
      console.error('Failed to create bookmark:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function updateBookmark(id: string, data: Partial<Bookmark>) {
    setLoading(true);
    try {
      const res = await bookmarkApi.update(id, data);
      const index = bookmarks.value.findIndex(b => b.id === id);
      if (index !== -1) {
        bookmarks.value[index] = res.data;
      }
      return res.data;
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function deleteBookmark(id: string) {
    setLoading(true);
    try {
      await bookmarkApi.delete(id);
      removeBookmark(id);
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    bookmarks,
    currentCategory,
    currentPage,
    pageSize,
    isLoading,
    total,
    categories,
    filteredBookmarks,
    paginatedBookmarks,
    totalPages,
    favoriteBookmarks,
    setBookmarks,
    setPagination,
    setCurrentCategory,
    setCurrentPage,
    setLoading,
    addBookmark,
    updateBookmark,
    removeBookmark,
    toggleFavorite,
  };
});