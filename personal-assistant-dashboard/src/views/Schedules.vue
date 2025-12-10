<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, type Schedule } from '../api';

const emit = defineEmits<{ update: [] }>();

const schedules = ref<Schedule[]>([]);
const loading = ref(true);
const showForm = ref(false);
const editingId = ref<number | null>(null);
const selectedDate = ref<Date>(new Date());
const currentMonth = ref<Date>(new Date());

const form = ref({
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
  tags: '',
});

// Calendar helpers
const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; hasSchedule: boolean }[] = [];
  
  // Previous month days
  const startDayOfWeek = firstDay.getDay();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      hasSchedule: hasScheduleOnDate(date),
    });
  }
  
  // Current month days
  const today = new Date();
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      isSelected: date.toDateString() === selectedDate.value.toDateString(),
      hasSchedule: hasScheduleOnDate(date),
    });
  }
  
  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      hasSchedule: hasScheduleOnDate(date),
    });
  }
  
  return days;
});

const hasScheduleOnDate = (date: Date) => {
  return schedules.value.some(s => {
    const scheduleDate = new Date(s.start_time).toDateString();
    return scheduleDate === date.toDateString();
  });
};

const getSchedulesForDate = (date: Date) => {
  return schedules.value.filter(s => {
    const scheduleDate = new Date(s.start_time).toDateString();
    return scheduleDate === date.toDateString();
  });
};

const selectedDateSchedules = computed(() => getSchedulesForDate(selectedDate.value));

const currentMonthName = computed(() => {
  return currentMonth.value.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
});

const prevMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1);
};

const goToToday = () => {
  const today = new Date();
  currentMonth.value = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedDate.value = today;
};

const selectDate = (date: Date) => {
  selectedDate.value = date;
  currentMonth.value = new Date(date.getFullYear(), date.getMonth(), 1);
};

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

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatSelectedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
});

const isToday = (dateStr: string) => {
  const today = new Date().toDateString();
  return new Date(dateStr).toDateString() === today;
};

onMounted(loadSchedules);
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-display font-bold text-gray-800">📅 일정</h2>
      <button @click="showForm = true" class="btn btn-primary">
        + 새 일정
      </button>
    </div>

    <!-- Form Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="resetForm">
          <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-up">
            <h3 class="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <span class="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-sm">📅</span>
              {{ editingId ? '일정 수정' : '새 일정' }}
            </h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input v-model="form.title" type="text" class="input" required placeholder="일정 제목" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea v-model="form.description" rows="2" class="input resize-none" placeholder="일정 설명 (선택)"></textarea>
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
                <input v-model="form.location" type="text" class="input" placeholder="장소 (선택)" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">태그 (쉼표로 구분)</label>
                <input v-model="form.tags" type="text" class="input" placeholder="회의, 업무, 개인" />
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

    <!-- Main Content -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Calendar (Hidden on small screens) -->
      <div class="hidden lg:block w-80 flex-shrink-0">
        <div class="card sticky top-8">
          <!-- Calendar Header -->
          <div class="flex items-center justify-between mb-4">
            <button @click="prevMonth" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              ‹
            </button>
            <h3 class="font-display font-bold text-gray-800">{{ currentMonthName }}</h3>
            <button @click="nextMonth" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              ›
            </button>
          </div>

          <!-- Today Button -->
          <button @click="goToToday" class="w-full mb-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            오늘로 이동
          </button>

          <!-- Days of Week -->
          <div class="grid grid-cols-7 mb-2">
            <div
              v-for="day in daysOfWeek"
              :key="day"
              :class="[
                'text-center text-xs font-medium py-2',
                day === '일' ? 'text-red-500' : day === '토' ? 'text-blue-500' : 'text-gray-500'
              ]"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="(day, index) in calendarDays"
              :key="index"
              @click="selectDate(day.date)"
              :class="[
                'relative aspect-square flex items-center justify-center text-sm rounded-lg transition-all',
                day.isCurrentMonth ? 'text-gray-700' : 'text-gray-300',
                day.isToday && !day.isSelected && 'ring-2 ring-primary-400 ring-inset',
                day.isSelected && 'bg-gradient-to-br from-primary-500 to-violet-500 text-white shadow-lg',
                !day.isSelected && day.isCurrentMonth && 'hover:bg-gray-100',
                day.date.getDay() === 0 && day.isCurrentMonth && !day.isSelected && 'text-red-500',
                day.date.getDay() === 6 && day.isCurrentMonth && !day.isSelected && 'text-blue-500',
              ]"
            >
              {{ day.date.getDate() }}
              <!-- Schedule Indicator -->
              <span
                v-if="day.hasSchedule && !day.isSelected"
                class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"
              ></span>
            </button>
          </div>

          <!-- Selected Date Info -->
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-sm font-medium text-gray-600">{{ formatSelectedDate }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ selectedDateSchedules.length }}개의 일정
            </p>
          </div>
        </div>
      </div>

      <!-- Schedule List -->
      <div class="flex-1 min-w-0">
        <!-- Mobile: Show all schedules, Desktop: Show selected date schedules -->
        <div class="lg:hidden">
          <!-- All Schedules for Mobile -->
          <div v-if="loading" class="text-center py-12 text-gray-400">
            <div class="animate-pulse-soft text-4xl mb-2">📅</div>
            로딩 중...
          </div>
          <div v-else-if="schedules.length === 0" class="empty-state">
            <div class="empty-state-icon">📭</div>
            <p class="text-gray-500">일정이 없습니다</p>
            <p class="text-sm text-gray-400 mt-1">새 일정을 추가해보세요!</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(schedule, index) in schedules"
              :key="schedule.id"
              :class="[
                'card transition-all animate-slide-up',
                isToday(schedule.start_time) && 'border-l-4 border-l-primary-500'
              ]"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-800">{{ schedule.title }}</span>
                    <span v-if="isToday(schedule.start_time)" class="tag tag-primary text-xs">
                      오늘
                    </span>
                  </div>
                  <p v-if="schedule.description" class="text-sm text-gray-500 mt-1 line-clamp-2">
                    {{ schedule.description }}
                  </p>
                  <div class="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                    <span class="flex items-center gap-1">
                      <span>🕐</span>
                      {{ formatDateTime(schedule.start_time) }}
                    </span>
                    <span v-if="schedule.end_time">~ {{ formatDateTime(schedule.end_time) }}</span>
                    <span v-if="schedule.location" class="flex items-center gap-1">
                      <span>📍</span>
                      {{ schedule.location }}
                    </span>
                  </div>
                  <div class="flex gap-1 mt-2">
                    <span
                      v-for="tag in schedule.tags"
                      :key="tag"
                      class="tag tag-gray text-xs"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <div class="flex gap-2 ml-4 opacity-60 hover:opacity-100 transition-opacity">
                  <button @click="handleEdit(schedule)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-500 transition-all">
                    ✏️
                  </button>
                  <button @click="handleDelete(schedule.id)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop: Selected Date Schedules -->
        <div class="hidden lg:block">
          <div class="card mb-4">
            <h3 class="font-display font-bold text-gray-800 flex items-center gap-2">
              <span class="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-sm">📅</span>
              {{ formatSelectedDate }}
            </h3>
          </div>

          <div v-if="loading" class="text-center py-12 text-gray-400">
            <div class="animate-pulse-soft text-4xl mb-2">📅</div>
            로딩 중...
          </div>
          <div v-else-if="selectedDateSchedules.length === 0" class="empty-state card">
            <div class="empty-state-icon">🌴</div>
            <p class="text-gray-500">이 날짜에 일정이 없습니다</p>
            <p class="text-sm text-gray-400 mt-1">새 일정을 추가해보세요!</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(schedule, index) in selectedDateSchedules"
              :key="schedule.id"
              class="card hover:shadow-lg transition-all animate-slide-up group"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              <div class="flex items-start gap-4">
                <!-- Time Column -->
                <div class="flex-shrink-0 w-20 text-center">
                  <div class="text-lg font-bold text-primary-600">{{ formatTime(schedule.start_time) }}</div>
                  <div v-if="schedule.end_time" class="text-xs text-gray-400">
                    ~ {{ formatTime(schedule.end_time) }}
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0 border-l-2 border-primary-200 pl-4">
                  <h4 class="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                    {{ schedule.title }}
                  </h4>
                  <p v-if="schedule.description" class="text-sm text-gray-500 mt-1">
                    {{ schedule.description }}
                  </p>
                  <div v-if="schedule.location" class="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <span>📍</span>
                    <span>{{ schedule.location }}</span>
                  </div>
                  <div class="flex gap-1.5 mt-2">
                    <span
                      v-for="tag in schedule.tags"
                      :key="tag"
                      class="tag tag-gray text-xs"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="handleEdit(schedule)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-500 transition-all">
                    ✏️
                  </button>
                  <button @click="handleDelete(schedule.id)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- All Schedules Section -->
          <div class="mt-8">
            <h3 class="font-display font-bold text-gray-600 mb-4 flex items-center gap-2">
              <span>📋</span> 전체 일정
              <span class="text-sm font-normal text-gray-400">({{ schedules.length }}개)</span>
            </h3>
            <div class="space-y-2">
              <div
                v-for="schedule in schedules"
                :key="schedule.id"
                @click="selectDate(new Date(schedule.start_time))"
                :class="[
                  'p-3 rounded-xl cursor-pointer transition-all',
                  new Date(schedule.start_time).toDateString() === selectedDate.toDateString()
                    ? 'bg-primary-50 border border-primary-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                ]"
              >
                <div class="flex items-center gap-3">
                  <div class="text-xs font-medium text-gray-500 w-20">
                    {{ formatDateTime(schedule.start_time).split(' ').slice(0, 2).join(' ') }}
                  </div>
                  <div class="flex-1 font-medium text-gray-700 truncate">{{ schedule.title }}</div>
                  <span v-if="isToday(schedule.start_time)" class="tag tag-primary text-xs">오늘</span>
                </div>
              </div>
            </div>
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
