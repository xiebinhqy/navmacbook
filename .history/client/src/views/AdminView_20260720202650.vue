<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1>书签管理</h1>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加书签
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索书签名称或URL..."
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 书签列表 -->
    <div class="bookmark-list">
      <el-table :data="displayBookmarks" stripe style="width: 100%">
        <el-table-column prop="name" label="名称" width="200" />
        <el-table-column prop="url" label="URL" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="is_favorite" label="收藏" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.is_favorite" color="#e6a23c"><StarFilled /></el-icon>
            <el-icon v-else><Star /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="editBookmark(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteBookmark(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingBookmark ? '编辑书签' : '添加书签'"
      width="500px"
    >
      <el-form :model="bookmarkForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="bookmarkForm.name" placeholder="书签名称" />
        </el-form-item>
        <el-form-item label="URL" required>
          <el-input v-model="bookmarkForm.url" placeholder="https://example.com" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="bookmarkForm.category" placeholder="default" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="bookmarkForm.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="收藏">
          <el-switch v-model="bookmarkForm.is_favorite" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveBookmark">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useBookmarkStore } from '../stores/bookmarkStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Star, StarFilled, Plus } from '@element-plus/icons-vue';
import type { Bookmark } from '../types';

const bookmarkStore = useBookmarkStore();

const searchQuery = ref('');
const showAddDialog = ref(false);
const editingBookmark = ref<Bookmark | null>(null);
const bookmarkForm = reactive({
  name: '',
  url: '',
  category: 'default',
  sort_order: 0,
  is_favorite: false,
});

// 搜索过滤后的书签
const displayBookmarks = ref<Bookmark[]>([]);

function handleSearch() {
  const query = searchQuery.value.toLowerCase();
  if (!query) {
    displayBookmarks.value = bookmarkStore.bookmarks;
    return;
  }
  displayBookmarks.value = bookmarkStore.bookmarks.filter(b =>
    b.name.toLowerCase().includes(query) || b.url.toLowerCase().includes(query)
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN');
}

async function loadBookmarks() {
  await bookmarkStore.fetchBookmarks();
  displayBookmarks.value = bookmarkStore.bookmarks;
}

function editBookmark(bookmark: Bookmark) {
  editingBookmark.value = bookmark;
  bookmarkForm.name = bookmark.name;
  bookmarkForm.url = bookmark.url;
  bookmarkForm.category = bookmark.category;
  bookmarkForm.sort_order = bookmark.sort_order;
  bookmarkForm.is_favorite = bookmark.is_favorite === 1;
  showAddDialog.value = true;
}

async function saveBookmark() {
  if (!bookmarkForm.name || !bookmarkForm.url) {
    ElMessage.warning('请填写书签名称和URL');
    return;
  }

  try {
    if (editingBookmark.value) {
      await bookmarkStore.updateBookmark(editingBookmark.value.id, {
        name: bookmarkForm.name,
        url: bookmarkForm.url,
        category: bookmarkForm.category,
        sort_order: bookmarkForm.sort_order,
        is_favorite: bookmarkForm.is_favorite ? 1 : 0,
      });
      ElMessage.success('书签更新成功');
    } else {
      await bookmarkStore.createBookmark({
        name: bookmarkForm.name,
        url: bookmarkForm.url,
        category: bookmarkForm.category,
        sort_order: bookmarkForm.sort_order,
        is_favorite: bookmarkForm.is_favorite ? 1 : 0,
      });
      ElMessage.success('书签添加成功');
    }
    showAddDialog.value = false;
    resetForm();
    await loadBookmarks();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败');
  }
}

function resetForm() {
  editingBookmark.value = null;
  bookmarkForm.name = '';
  bookmarkForm.url = '';
  bookmarkForm.category = 'default';
  bookmarkForm.sort_order = 0;
  bookmarkForm.is_favorite = false;
}

async function deleteBookmark(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个书签吗？', '确认删除', {
      type: 'warning',
    });
    await bookmarkStore.deleteBookmark(id);
    ElMessage.success('书签已删除');
    await loadBookmarks();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败');
    }
  }
}

onMounted(() => {
  loadBookmarks();
});
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.admin-header h1 {
  margin: 0;
  color: #333;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar .el-input {
  width: 400px;
}

.bookmark-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>