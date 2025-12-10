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
  <div class="space-y-4 sm:space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-800">🔖 북마크</h2>
      <button @click="showForm = true" class="btn btn-primary self-start sm:self-auto">
        + 새 북마크
      </button>
    </div>

    <!-- Search -->
    <div class="flex gap-2 sm:gap-4">
      <input
        v-model="searchQuery"
        @keyup.enter="loadBookmarks"
        type="text"
        placeholder="북마크 검색..."
        class="input flex-1"
      />
      <button @click="loadBookmarks" class="btn btn-secondary">
        <span class="sm:hidden">🔍</span>
        <span class="hidden sm:inline">검색</span>
      </button>
    </div>

    <!-- Form Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="resetForm">
          <div class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-2xl animate-slide-up">
            <h3 class="text-lg sm:text-xl font-display font-bold mb-4 flex items-center gap-2">
              <span class="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-sm">🔖</span>
              {{ editingId ? '북마크 수정' : '새 북마크' }}
            </h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input v-model="form.url" type="url" class="input" placeholder="https://..." required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input v-model="form.title" type="text" class="input" required placeholder="북마크 제목" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea v-model="form.description" rows="2" class="input resize-none" placeholder="설명 (선택)"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">태그 (쉼표로 구분)</label>
                <input v-model="form.tags" type="text" class="input" placeholder="개발, 참고, 문서" />
              </div>
              <div class="flex gap-3 justify-end pt-2">
                <button type="button" @click="resetForm" class="btn btn-secondary">취소</button>
                <button type="submit" class="btn btn-primary">저장</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Bookmark List -->
    <div v-if="loading" class="text-center py-12 text-gray-400">
      <div class="animate-pulse-soft text-4xl mb-2">🔖</div>
      로딩 중...
    </div>
    <div v-else-if="bookmarks.length === 0" class="empty-state card">
      <div class="empty-state-icon">📭</div>
      <p class="text-gray-500">북마크가 없습니다</p>
      <p class="text-sm text-gray-400 mt-1">유용한 링크를 저장해보세요!</p>
    </div>
    <div v-else class="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
      <div
        v-for="(bookmark, index) in bookmarks"
        :key="bookmark.id"
        class="card !p-3 sm:!p-4 hover:shadow-lg transition-all group animate-slide-up"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            🔗
          </div>
          <div class="flex-1 min-w-0">
            <a
              :href="bookmark.url"
              target="_blank"
              class="font-semibold text-gray-800 hover:text-primary-600 line-clamp-1 text-sm sm:text-base"
            >
              {{ bookmark.title }}
            </a>
            <p class="text-xs text-gray-400 mt-0.5 truncate">{{ getDomain(bookmark.url) }}</p>
            <p v-if="bookmark.description" class="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-2">
              {{ bookmark.description }}
            </p>
            <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
              <span
                v-for="tag in bookmark.tags.slice(0, 3)"
                :key="tag"
                class="tag bg-purple-100 text-purple-700 text-xs"
              >
                {{ tag }}
              </span>
              <span v-if="bookmark.tags.length > 3" class="text-xs text-gray-400">
                +{{ bookmark.tags.length - 3 }}
              </span>
              <span class="text-xs text-gray-400 ml-auto">
                {{ formatDate(bookmark.created_at) }}
              </span>
            </div>
          </div>
          <div class="flex gap-1 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button @click="handleEdit(bookmark)" class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-500 transition-all">
              ✏️
            </button>
            <button @click="handleDelete(bookmark.id)" class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .animate-slide-up,
.modal-leave-active .animate-slide-up {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .animate-slide-up,
.modal-leave-to .animate-slide-up {
  transform: translateY(10px);
  opacity: 0;
}
</style>
