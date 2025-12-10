<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMemos, createMemo, updateMemo, deleteMemo, type Memo } from '../api';

const emit = defineEmits<{ update: [] }>();

const memos = ref<Memo[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const showForm = ref(false);
const editingId = ref<number | null>(null);
const selectedMemo = ref<Memo | null>(null);

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
  selectedMemo.value = null;
  showForm.value = true;
};

const handleDelete = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await deleteMemo(id);
    selectedMemo.value = null;
    loadMemos();
    emit('update');
  } catch (error) {
    console.error('Failed to delete memo:', error);
  }
};

const openDetail = (memo: Memo) => {
  selectedMemo.value = memo;
};

const closeDetail = () => {
  selectedMemo.value = null;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatFullDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// \n 문자열을 실제 줄바꿈으로 변환
const formatContent = (content: string) => {
  return content
    .replace(/\\n/g, '\n')  // \n 문자열을 실제 줄바꿈으로
    .replace(/\\t/g, '\t'); // \t 문자열을 실제 탭으로
};

onMounted(loadMemos);
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-display font-bold text-gray-800">📝 메모</h2>
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
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="resetForm">
          <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-up">
            <h3 class="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <span class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-sm">📝</span>
              {{ editingId ? '메모 수정' : '새 메모' }}
            </h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input v-model="form.title" type="text" class="input" required placeholder="메모 제목을 입력하세요" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea v-model="form.content" rows="6" class="input resize-none" required placeholder="메모 내용을 입력하세요"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">태그 (쉼표로 구분)</label>
                <input v-model="form.tags" type="text" class="input" placeholder="태그1, 태그2, 태그3" />
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

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedMemo" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeDetail">
          <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="p-6 border-b border-gray-100">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-xl font-display font-bold text-gray-900">{{ selectedMemo.title }}</h3>
                  <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span class="flex items-center gap-1">
                      <span>📅</span>
                      {{ formatFullDate(selectedMemo.created_at) }}
                    </span>
                    <span v-if="selectedMemo.updated_at !== selectedMemo.created_at" class="flex items-center gap-1">
                      <span>✏️</span>
                      수정됨
                    </span>
                  </div>
                </div>
                <button @click="closeDetail" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  ✕
                </button>
              </div>
              
              <!-- Tags -->
              <div v-if="selectedMemo.tags.length" class="flex flex-wrap gap-2 mt-4">
                <span
                  v-for="tag in selectedMemo.tags"
                  :key="tag"
                  class="tag tag-primary"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-6 flex-1 overflow-y-auto">
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ formatContent(selectedMemo.content) }}</p>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button @click="handleEdit(selectedMemo)" class="btn btn-secondary">
                <span>✏️</span> 수정
              </button>
              <button @click="handleDelete(selectedMemo.id)" class="btn btn-danger">
                <span>🗑️</span> 삭제
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Memo List -->
    <div v-if="loading" class="text-center py-12 text-gray-400">
      <div class="animate-pulse-soft text-4xl mb-2">📝</div>
      로딩 중...
    </div>
    <div v-else-if="memos.length === 0" class="empty-state">
      <div class="empty-state-icon">📭</div>
      <p class="text-gray-500">메모가 없습니다</p>
      <p class="text-sm text-gray-400 mt-1">새 메모를 작성해보세요!</p>
    </div>
    <div v-else class="grid gap-4">
      <div
        v-for="(memo, index) in memos"
        :key="memo.id"
        @click="openDetail(memo)"
        class="card hover:shadow-lg cursor-pointer group animate-slide-up"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors truncate">{{ memo.title }}</h3>
              <span class="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">클릭하여 상세보기</span>
            </div>
            <p class="text-gray-600 mt-2 whitespace-pre-wrap line-clamp-3 text-sm">{{ formatContent(memo.content) }}</p>
            <div class="flex items-center gap-2 mt-3 flex-wrap">
              <span
                v-for="tag in memo.tags"
                :key="tag"
                class="tag tag-primary text-xs"
              >
                {{ tag }}
              </span>
            </div>
            <div class="text-xs text-gray-400 mt-2">
              {{ formatDate(memo.updated_at) }}
            </div>
          </div>
          <div class="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click.stop="handleEdit(memo)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-500 transition-all">
              ✏️
            </button>
            <button @click.stop="handleDelete(memo.id)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
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
