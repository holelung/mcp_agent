<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMemos, createMemo, updateMemo, deleteMemo, type Memo } from '../api';

const emit = defineEmits<{ update: [] }>();

const memos = ref<Memo[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const showForm = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  title: '',
  content: '',
  tags: '',
});

const loadMemos = async () => {
  loading.value = true;
  try {
    memos.value = await getMemos(searchQuery.value || undefined);
  } catch (error) {
    console.error('Failed to load memos:', error);
  }
  loading.value = false;
};

const resetForm = () => {
  form.value = { title: '', content: '', tags: '' };
  editingId.value = null;
  showForm.value = false;
};

const handleSubmit = async () => {
  const data = {
    title: form.value.title,
    content: form.value.content,
    tags: form.value.tags.split(',').map(t => t.trim()).filter(Boolean),
  };

  try {
    if (editingId.value) {
      await updateMemo(editingId.value, data);
    } else {
      await createMemo(data);
    }
    resetForm();
    loadMemos();
    emit('update');
  } catch (error) {
    console.error('Failed to save memo:', error);
  }
};

const handleEdit = (memo: Memo) => {
  form.value = {
    title: memo.title,
    content: memo.content,
    tags: memo.tags.join(', '),
  };
  editingId.value = memo.id;
  showForm.value = true;
};

const handleDelete = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await deleteMemo(id);
    loadMemos();
    emit('update');
  } catch (error) {
    console.error('Failed to delete memo:', error);
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(loadMemos);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">📝 메모</h2>
      <button @click="showForm = true" class="btn btn-primary">
        + 새 메모
      </button>
    </div>

    <!-- Search -->
    <div class="flex gap-4">
      <input
        v-model="searchQuery"
        @keyup.enter="loadMemos"
        type="text"
        placeholder="메모 검색..."
        class="input flex-1"
      />
      <button @click="loadMemos" class="btn btn-secondary">검색</button>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-xl font-bold mb-4">
          {{ editingId ? '메모 수정' : '새 메모' }}
        </h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input v-model="form.title" type="text" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">내용</label>
            <textarea v-model="form.content" rows="5" class="input" required></textarea>
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

    <!-- Memo List -->
    <div v-if="loading" class="text-center py-12 text-gray-400">로딩 중...</div>
    <div v-else-if="memos.length === 0" class="text-center py-12 text-gray-400">
      메모가 없습니다
    </div>
    <div v-else class="grid gap-4">
      <div
        v-for="memo in memos"
        :key="memo.id"
        class="card hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800">{{ memo.title }}</h3>
            <p class="text-gray-600 mt-2 whitespace-pre-wrap line-clamp-3">{{ memo.content }}</p>
            <div class="flex items-center gap-2 mt-3">
              <span
                v-for="tag in memo.tags"
                :key="tag"
                class="tag bg-primary-100 text-primary-700"
              >
                {{ tag }}
              </span>
            </div>
            <div class="text-xs text-gray-400 mt-2">
              {{ formatDate(memo.updated_at) }}
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button @click="handleEdit(memo)" class="text-gray-400 hover:text-primary-500">
              ✏️
            </button>
            <button @click="handleDelete(memo.id)" class="text-gray-400 hover:text-red-500">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

