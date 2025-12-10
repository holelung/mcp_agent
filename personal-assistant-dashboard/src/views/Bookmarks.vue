<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getBookmarks, createBookmark, updateBookmark, deleteBookmark, type Bookmark } from '../api';

const emit = defineEmits<{ update: [] }>();

const bookmarks = ref<Bookmark[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const showForm = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  url: '',
  title: '',
  description: '',
  tags: '',
});

const loadBookmarks = async () => {
  loading.value = true;
  try {
    bookmarks.value = await getBookmarks(searchQuery.value || undefined);
  } catch (error) {
    console.error('Failed to load bookmarks:', error);
  }
  loading.value = false;
};

const resetForm = () => {
  form.value = { url: '', title: '', description: '', tags: '' };
  editingId.value = null;
  showForm.value = false;
};

const handleSubmit = async () => {
  const data = {
    url: form.value.url,
    title: form.value.title,
    description: form.value.description,
    tags: form.value.tags.split(',').map(t => t.trim()).filter(Boolean),
  };

  try {
    if (editingId.value) {
      await updateBookmark(editingId.value, data);
    } else {
      await createBookmark(data);
    }
    resetForm();
    loadBookmarks();
    emit('update');
  } catch (error) {
    console.error('Failed to save bookmark:', error);
  }
};

const handleEdit = (bookmark: Bookmark) => {
  form.value = {
    url: bookmark.url,
    title: bookmark.title,
    description: bookmark.description,
    tags: bookmark.tags.join(', '),
  };
  editingId.value = bookmark.id;
  showForm.value = true;
};

const handleDelete = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await deleteBookmark(id);
    loadBookmarks();
    emit('update');
  } catch (error) {
    console.error('Failed to delete bookmark:', error);
  }
};

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
};

onMounted(loadBookmarks);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">🔖 북마크</h2>
      <button @click="showForm = true" class="btn btn-primary">
        + 새 북마크
      </button>
    </div>

    <!-- Search -->
    <div class="flex gap-4">
      <input
        v-model="searchQuery"
        @keyup.enter="loadBookmarks"
        type="text"
        placeholder="북마크 검색..."
        class="input flex-1"
      />
      <button @click="loadBookmarks" class="btn btn-secondary">검색</button>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-xl font-bold mb-4">
          {{ editingId ? '북마크 수정' : '새 북마크' }}
        </h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input v-model="form.url" type="url" class="input" placeholder="https://..." required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input v-model="form.title" type="text" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea v-model="form.description" rows="2" class="input"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">태그 (쉼표로 구분)</label>
            <input v-model="form.tags" type="text" class="input" placeholder="태그1, 태그2" />
          </div>
          <div class="flex gap-3 justify-end">
            <button type="button" @click="resetForm" class="btn btn-secondary">취소</button>
            <button type="submit" class="btn btn-primary">저장</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Bookmark List -->
    <div v-if="loading" class="text-center py-12 text-gray-400">로딩 중...</div>
    <div v-else-if="bookmarks.length === 0" class="text-center py-12 text-gray-400">
      북마크가 없습니다
    </div>
    <div v-else class="grid gap-4 md:grid-cols-2">
      <div
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        class="card hover:shadow-md transition-all group"
      >
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
            🔗
          </div>
          <div class="flex-1 min-w-0">
            <a
              :href="bookmark.url"
              target="_blank"
              class="font-semibold text-gray-800 hover:text-primary-600 line-clamp-1"
            >
              {{ bookmark.title }}
            </a>
            <p class="text-xs text-gray-400 mt-0.5">{{ getDomain(bookmark.url) }}</p>
            <p v-if="bookmark.description" class="text-sm text-gray-500 mt-2 line-clamp-2">
              {{ bookmark.description }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <span
                v-for="tag in bookmark.tags"
                :key="tag"
                class="tag bg-purple-100 text-purple-700"
              >
                {{ tag }}
              </span>
              <span class="text-xs text-gray-400 ml-auto">
                {{ formatDate(bookmark.created_at) }}
              </span>
            </div>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="handleEdit(bookmark)" class="text-gray-400 hover:text-primary-500">
              ✏️
            </button>
            <button @click="handleDelete(bookmark.id)" class="text-gray-400 hover:text-red-500">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

