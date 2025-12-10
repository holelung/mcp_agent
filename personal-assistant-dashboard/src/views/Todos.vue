<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTodos, createTodo, updateTodo, deleteTodo, type Todo } from '../api';

const emit = defineEmits<{ update: [] }>();

const todos = ref<Todo[]>([]);
const loading = ref(true);
const filter = ref<'all' | 'active' | 'completed'>('all');
const showForm = ref(false);
const editingId = ref<number | null>(null);

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

const handleToggle = async (todo: Todo) => {
  try {
    await updateTodo(todo.id, { completed: !todo.completed });
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
  showForm.value = true;
};

const handleDelete = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await deleteTodo(id);
    loadTodos();
    emit('update');
  } catch (error) {
    console.error('Failed to delete todo:', error);
  }
};

const priorityClass = (priority: string) => {
  switch (priority) {
    case 'high': return 'priority-high';
    case 'medium': return 'priority-medium';
    case 'low': return 'priority-low';
    default: return '';
  }
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

onMounted(loadTodos);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">✅ 할 일</h2>
      <button @click="showForm = true" class="btn btn-primary">
        + 새 할 일
      </button>
    </div>

    <!-- Filter -->
    <div class="flex gap-2">
      <button
        v-for="f in ['all', 'active', 'completed'] as const"
        :key="f"
        @click="filter = f; loadTodos()"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
          filter === f ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ f === 'all' ? '전체' : f === 'active' ? '진행 중' : '완료' }}
      </button>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-xl font-bold mb-4">
          {{ editingId ? '할 일 수정' : '새 할 일' }}
        </h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input v-model="form.title" type="text" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea v-model="form.description" rows="3" class="input"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
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
            <input v-model="form.tags" type="text" class="input" placeholder="태그1, 태그2" />
          </div>
          <div class="flex gap-3 justify-end">
            <button type="button" @click="resetForm" class="btn btn-secondary">취소</button>
            <button type="submit" class="btn btn-primary">저장</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Todo List -->
    <div v-if="loading" class="text-center py-12 text-gray-400">로딩 중...</div>
    <div v-else-if="todos.length === 0" class="text-center py-12 text-gray-400">
      할 일이 없습니다
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="todo in todos"
        :key="todo.id"
        :class="[
          'card flex items-center gap-4 transition-all',
          todo.completed && 'opacity-60'
        ]"
      >
        <button
          @click="handleToggle(todo)"
          :class="[
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
            todo.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-primary-500'
          ]"
        >
          <span v-if="todo.completed">✓</span>
        </button>
        
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span :class="['font-medium', todo.completed && 'line-through text-gray-400']">
              {{ todo.title }}
            </span>
            <span :class="['tag', priorityClass(todo.priority)]">
              {{ todo.priority === 'high' ? '높음' : todo.priority === 'medium' ? '보통' : '낮음' }}
            </span>
          </div>
          <p v-if="todo.description" class="text-sm text-gray-500 mt-1">
            {{ todo.description }}
          </p>
          <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span v-if="todo.due_date">📅 {{ formatDate(todo.due_date) }}</span>
            <span v-for="tag in todo.tags" :key="tag" class="tag bg-gray-100 text-gray-600">
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button @click="handleEdit(todo)" class="text-gray-400 hover:text-primary-500">✏️</button>
          <button @click="handleDelete(todo.id)" class="text-gray-400 hover:text-red-500">🗑️</button>
        </div>
      </div>
    </div>
  </div>
</template>

