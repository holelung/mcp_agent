<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, type Schedule } from '../api';

const emit = defineEmits<{ update: [] }>();

const schedules = ref<Schedule[]>([]);
const loading = ref(true);
const showForm = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
  tags: '',
});

const loadSchedules = async () => {
  loading.value = true;
  try {
    schedules.value = await getSchedules();
  } catch (error) {
    console.error('Failed to load schedules:', error);
  }
  loading.value = false;
};

const resetForm = () => {
  form.value = { title: '', description: '', start_time: '', end_time: '', location: '', tags: '' };
  editingId.value = null;
  showForm.value = false;
};

const handleSubmit = async () => {
  const data = {
    title: form.value.title,
    description: form.value.description,
    start_time: form.value.start_time,
    end_time: form.value.end_time || null,
    location: form.value.location,
    tags: form.value.tags.split(',').map(t => t.trim()).filter(Boolean),
  };

  try {
    if (editingId.value) {
      await updateSchedule(editingId.value, data);
    } else {
      await createSchedule(data);
    }
    resetForm();
    loadSchedules();
    emit('update');
  } catch (error) {
    console.error('Failed to save schedule:', error);
  }
};

const handleEdit = (schedule: Schedule) => {
  form.value = {
    title: schedule.title,
    description: schedule.description,
    start_time: schedule.start_time.slice(0, 16),
    end_time: schedule.end_time?.slice(0, 16) || '',
    location: schedule.location,
    tags: schedule.tags.join(', '),
  };
  editingId.value = schedule.id;
  showForm.value = true;
};

const handleDelete = async (id: number) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await deleteSchedule(id);
    loadSchedules();
    emit('update');
  } catch (error) {
    console.error('Failed to delete schedule:', error);
  }
};

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isToday = (dateStr: string) => {
  const today = new Date().toDateString();
  return new Date(dateStr).toDateString() === today;
};

onMounted(loadSchedules);
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">📅 일정</h2>
      <button @click="showForm = true" class="btn btn-primary">
        + 새 일정
      </button>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-xl font-bold mb-4">
          {{ editingId ? '일정 수정' : '새 일정' }}
        </h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input v-model="form.title" type="text" class="input" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
            <textarea v-model="form.description" rows="2" class="input"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
              <input v-model="form.start_time" type="datetime-local" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
              <input v-model="form.end_time" type="datetime-local" class="input" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">장소</label>
            <input v-model="form.location" type="text" class="input" placeholder="선택사항" />
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

    <!-- Schedule List -->
    <div v-if="loading" class="text-center py-12 text-gray-400">로딩 중...</div>
    <div v-else-if="schedules.length === 0" class="text-center py-12 text-gray-400">
      일정이 없습니다
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="schedule in schedules"
        :key="schedule.id"
        :class="[
          'card transition-all',
          isToday(schedule.start_time) && 'border-l-4 border-l-primary-500'
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-800">{{ schedule.title }}</span>
              <span v-if="isToday(schedule.start_time)" class="tag bg-primary-100 text-primary-700">
                오늘
              </span>
            </div>
            <p v-if="schedule.description" class="text-sm text-gray-500 mt-1">
              {{ schedule.description }}
            </p>
            <div class="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
              <span>🕐 {{ formatDateTime(schedule.start_time) }}</span>
              <span v-if="schedule.end_time">~ {{ formatDateTime(schedule.end_time) }}</span>
              <span v-if="schedule.location">📍 {{ schedule.location }}</span>
            </div>
            <div class="flex gap-1 mt-2">
              <span
                v-for="tag in schedule.tags"
                :key="tag"
                class="tag bg-green-100 text-green-700"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button @click="handleEdit(schedule)" class="text-gray-400 hover:text-primary-500">
              ✏️
            </button>
            <button @click="handleDelete(schedule.id)" class="text-gray-400 hover:text-red-500">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

