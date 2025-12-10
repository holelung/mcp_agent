<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTodos, createTodo, updateTodo, deleteTodo, type Todo } from '../api';

const emit = defineEmits<{ update: [] }>();

const todos = ref<Todo[]>([]);
const loading = ref(true);
const filter = ref<'all' | 'active' | 'completed'>('all');
const showForm = ref(false);
const editingId = ref<number | null>(null);
const selectedTodo = ref<Todo | null>(null);

const form = ref({
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  due_date: '',
  tags: '',
});

const loadTodos = async () => {
  loading.value = true;
  try {
    const completed = filter.value === 'all' ? undefined : filter.value === 'completed';
    todos.value = await getTodos(completed);
  } catch (error) {
    console.error('Failed to load todos:', error);
  }
  loading.value = false;
};

const resetForm = () => {
  form.value = { title: '', description: '', priority: 'medium', due_date: '', tags: '' };
  editingId.value = null;
  showForm.value = false;
};

const handleSubmit = async () => {
  const data = {
    title: form.value.title,
    description: form.value.description,
    priority: form.value.priority,
    due_date: form.value.due_date || null,
    tags: form.value.tags.split(',').map(t => t.trim()).filter(Boolean),
  };

  try {
    if (editingId.value) {
      await updateTodo(editingId.value, data);
    } else {
      await createTodo(data);
    }
    resetForm();
    loadTodos();
    emit('update');
  } catch (error) {
    console.error('Failed to save todo:', error);
  }
};

const handleToggle = async (todo: Todo, e?: Event) => {
  e?.stopPropagation();
  try {
    await updateTodo(todo.id, { completed: !todo.completed });
    // 상세 모달이 열려있으면 업데이트
    if (selectedTodo.value?.id === todo.id) {
      selectedTodo.value = { ...selectedTodo.value, completed: !todo.completed };
    }
    loadTodos();
    emit('update');
  } catch (error) {
    console.error('Failed to toggle todo:', error);
  }
};

const handleEdit = (todo: Todo) => {
  form.value = {
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    due_date: todo.due_date?.split('T')[0] || '',
    tags: todo.tags.join(', '),
  };
  editingId.value = todo.id;
  selectedTodo.value = null;
  showForm.value = true;
};

const handleDelete = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await deleteTodo(id);
    selectedTodo.value = null;
    loadTodos();
    emit('update');
  } catch (error) {
    console.error('Failed to delete todo:', error);
  }
};

const openDetail = (todo: Todo) => {
  selectedTodo.value = todo;
};

const closeDetail = () => {
  selectedTodo.value = null;
};

const priorityClass = (priority: string) => {
  switch (priority) {
    case 'high': return 'priority-high';
    case 'medium': return 'priority-medium';
    case 'low': return 'priority-low';
    default: return '';
  }
};

const priorityLabel = (priority: string) => {
  switch (priority) {
    case 'high': return '높음';
    case 'medium': return '보통';
    case 'low': return '낮음';
    default: return '';
  }
};

const priorityIcon = (priority: string) => {
  switch (priority) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '';
  }
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
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

const getDaysRemaining = (dueDate: string | null) => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const getDaysRemainingText = (dueDate: string | null) => {
  const days = getDaysRemaining(dueDate);
  if (days === null) return '';
  if (days < 0) return `${Math.abs(days)}일 지남`;
  if (days === 0) return '오늘 마감';
  if (days === 1) return '내일 마감';
  return `${days}일 남음`;
};

const getDaysRemainingClass = (dueDate: string | null) => {
  const days = getDaysRemaining(dueDate);
  if (days === null) return '';
  if (days < 0) return 'text-red-600 bg-red-50';
  if (days === 0) return 'text-orange-600 bg-orange-50';
  if (days <= 2) return 'text-amber-600 bg-amber-50';
  return 'text-gray-600 bg-gray-50';
};

onMounted(loadTodos);
</script>

<template>
  <div class="space-y-4 sm:space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 class="text-xl sm:text-2xl font-display font-bold text-gray-800">✅ 할 일</h2>
      <button @click="showForm = true" class="btn btn-primary self-start sm:self-auto">
        + 새 할 일
      </button>
    </div>

    <!-- Filter -->
    <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      <button
        v-for="f in ['all', 'active', 'completed'] as const"
        :key="f"
        @click="filter = f; loadTodos()"
        :class="[
          'px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
          filter === f ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-white/80 text-gray-600 hover:bg-gray-100'
        ]"
      >
        {{ f === 'all' ? '전체' : f === 'active' ? '진행 중' : '완료' }}
      </button>
    </div>

    <!-- Form Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="resetForm">
          <div class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-2xl animate-slide-up">
            <h3 class="text-lg sm:text-xl font-display font-bold mb-4 flex items-center gap-2">
              <span class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-sm">✅</span>
              {{ editingId ? '할 일 수정' : '새 할 일' }}
            </h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input v-model="form.title" type="text" class="input" required placeholder="할 일 제목" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea v-model="form.description" rows="3" class="input resize-none" placeholder="상세 설명 (선택)"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                  <select v-model="form.priority" class="input">
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                  <input v-model="form.due_date" type="date" class="input" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">태그 (쉼표로 구분)</label>
                <input v-model="form.tags" type="text" class="input" placeholder="업무, 개인, 중요" />
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
        <div v-if="selectedTodo" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeDetail">
          <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="p-4 sm:p-6 border-b border-gray-100">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                      @click="handleToggle(selectedTodo)"
                      :class="[
                        'w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                        selectedTodo.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-primary-500'
                      ]"
                    >
                      <span v-if="selectedTodo.completed" class="text-sm">✓</span>
                    </button>
                    <h3 :class="[
                      'text-lg sm:text-xl font-display font-bold break-words',
                      selectedTodo.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                    ]">
                      {{ selectedTodo.title }}
                    </h3>
                  </div>
                  
                  <!-- Status badges -->
                  <div class="flex flex-wrap items-center gap-2 mt-3">
                    <span :class="['tag text-xs sm:text-sm', priorityClass(selectedTodo.priority)]">
                      {{ priorityIcon(selectedTodo.priority) }} {{ priorityLabel(selectedTodo.priority) }}
                    </span>
                    <span v-if="selectedTodo.completed" class="tag bg-green-100 text-green-700 text-xs sm:text-sm">
                      ✅ 완료됨
                    </span>
                    <span v-else-if="selectedTodo.due_date" :class="['tag text-xs sm:text-sm', getDaysRemainingClass(selectedTodo.due_date)]">
                      ⏰ {{ getDaysRemainingText(selectedTodo.due_date) }}
                    </span>
                  </div>
                </div>
                <button @click="closeDetail" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                  ✕
                </button>
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-4 sm:p-6 flex-1 overflow-y-auto">
              <!-- Description -->
              <div v-if="selectedTodo.description" class="mb-6">
                <h4 class="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                  <span>📝</span> 설명
                </h4>
                <p class="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base bg-gray-50 p-4 rounded-xl">
                  {{ selectedTodo.description }}
                </p>
              </div>
              
              <!-- Due Date -->
              <div v-if="selectedTodo.due_date" class="mb-6">
                <h4 class="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                  <span>📅</span> 마감일
                </h4>
                <div class="flex items-center gap-3">
                  <span class="text-gray-700 font-medium">
                    {{ new Date(selectedTodo.due_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) }}
                  </span>
                </div>
              </div>
              
              <!-- Tags -->
              <div v-if="selectedTodo.tags.length" class="mb-6">
                <h4 class="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                  <span>🏷️</span> 태그
                </h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in selectedTodo.tags"
                    :key="tag"
                    class="tag tag-primary text-xs sm:text-sm"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
              
              <!-- Timestamps -->
              <div class="text-xs sm:text-sm text-gray-400 space-y-1 pt-4 border-t border-gray-100">
                <div class="flex items-center gap-2">
                  <span>📅 생성:</span>
                  <span>{{ formatFullDate(selectedTodo.created_at) }}</span>
                </div>
                <div v-if="selectedTodo.updated_at !== selectedTodo.created_at" class="flex items-center gap-2">
                  <span>✏️ 수정:</span>
                  <span>{{ formatFullDate(selectedTodo.updated_at) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="p-3 sm:p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row justify-between gap-2 sm:gap-3">
              <button 
                @click="handleToggle(selectedTodo)" 
                :class="[
                  'btn justify-center',
                  selectedTodo.completed ? 'btn-secondary' : 'bg-green-500 hover:bg-green-600 text-white'
                ]"
              >
                {{ selectedTodo.completed ? '↩️ 미완료로 변경' : '✅ 완료 처리' }}
              </button>
              <div class="flex gap-2 sm:gap-3">
                <button @click="handleEdit(selectedTodo)" class="btn btn-secondary justify-center flex-1 sm:flex-none">
                  <span>✏️</span> 수정
                </button>
                <button @click="handleDelete(selectedTodo.id)" class="btn btn-danger justify-center flex-1 sm:flex-none">
                  <span>🗑️</span> 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Todo List -->
    <div v-if="loading" class="text-center py-12 text-gray-400">
      <div class="animate-pulse-soft text-4xl mb-2">✅</div>
      로딩 중...
    </div>
    <div v-else-if="todos.length === 0" class="empty-state card">
      <div class="empty-state-icon">📭</div>
      <p class="text-gray-500">할 일이 없습니다</p>
      <p class="text-sm text-gray-400 mt-1">새 할 일을 추가해보세요!</p>
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="(todo, index) in todos"
        :key="todo.id"
        @click="openDetail(todo)"
        :class="[
          'card !p-3 sm:!p-4 flex items-start sm:items-center gap-3 sm:gap-4 transition-all group animate-slide-up cursor-pointer hover:shadow-lg',
          todo.completed && 'opacity-60'
        ]"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <button
          @click.stop="handleToggle(todo)"
          :class="[
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 sm:mt-0',
            todo.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-primary-500'
          ]"
        >
          <span v-if="todo.completed" class="text-xs">✓</span>
        </button>
        
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span :class="['font-medium text-sm sm:text-base group-hover:text-primary-600 transition-colors', todo.completed && 'line-through text-gray-400']">
              {{ todo.title }}
            </span>
            <span :class="['tag text-xs', priorityClass(todo.priority)]">
              {{ priorityLabel(todo.priority) }}
            </span>
            <span class="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
              클릭하여 상세보기
            </span>
          </div>
          <p v-if="todo.description" class="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
            {{ todo.description }}
          </p>
          <div class="flex flex-wrap items-center gap-2 mt-2">
            <span v-if="todo.due_date" class="text-xs text-gray-400 flex items-center gap-1">
              <span>📅</span> {{ formatDate(todo.due_date) }}
            </span>
            <span v-for="tag in todo.tags.slice(0, 2)" :key="tag" class="tag bg-gray-100 text-gray-600 text-xs">
              {{ tag }}
            </span>
            <span v-if="todo.tags.length > 2" class="text-xs text-gray-400">+{{ todo.tags.length - 2 }}</span>
          </div>
        </div>
        
        <div class="flex gap-1 sm:gap-2 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button @click.stop="handleEdit(todo)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-500 transition-all">
            ✏️
          </button>
          <button @click.stop="handleDelete(todo.id)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
            🗑️
          </button>
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
