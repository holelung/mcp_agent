<script setup lang="ts">
import type { Summary } from '../api';

defineProps<{
  summary: Summary | null;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '좋은 아침이에요! ☀️';
  if (hour < 18) return '좋은 오후에요! 🌤️';
  return '좋은 저녁이에요! 🌙';
};

const stats = [
  { key: 'memos', label: '메모', icon: '📝', color: 'blue', bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { key: 'todos', label: '미완료', icon: '✅', color: 'amber', bgColor: 'bg-gradient-to-br from-amber-500 to-orange-500', subLabel: true },
  { key: 'schedules', label: '오늘 일정', icon: '📅', color: 'emerald', bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
  { key: 'bookmarks', label: '북마크', icon: '🔖', color: 'violet', bgColor: 'bg-gradient-to-br from-violet-500 to-purple-500' },
];

const getStatValue = (summary: Summary | null, key: string) => {
  if (!summary) return 0;
  switch (key) {
    case 'memos': return summary.memos.total;
    case 'todos': return summary.todos.incomplete;
    case 'schedules': return summary.schedules.today.length;
    case 'bookmarks': return summary.bookmarks.total;
    default: return 0;
  }
};
</script>

<template>
  <div class="space-y-6 lg:space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <p class="text-gray-500 font-medium text-sm sm:text-base">{{ getGreeting() }}</p>
        <h2 class="text-2xl sm:text-3xl font-display font-bold text-gray-900 mt-1">대시보드</h2>
        <p class="text-gray-400 mt-2 flex items-center gap-2 text-sm">
          <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          {{ summary?.date || '로딩 중...' }}
        </p>
      </div>
      <button 
        @click="emit('refresh')" 
        class="btn btn-secondary group self-start"
      >
        <span class="transition-transform duration-300 group-hover:rotate-180">🔄</span>
        <span class="hidden sm:inline">새로고침</span>
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      <div 
        v-for="(stat, index) in stats" 
        :key="stat.key" 
        class="card !p-4 sm:!p-6 animate-slide-up relative overflow-hidden group"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <!-- Background Gradient Circle -->
        <div :class="[
          'absolute -right-4 -top-4 w-16 sm:w-24 h-16 sm:h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150',
          stat.bgColor
        ]"></div>

        <div class="relative flex items-center justify-between">
          <div class="min-w-0">
            <p class="text-xs sm:text-sm text-gray-500 font-medium truncate">{{ stat.label }}</p>
            <p class="text-2xl sm:text-3xl font-display font-bold text-gray-900 mt-1 sm:mt-2">
              {{ getStatValue(summary, stat.key) }}
            </p>
            <p v-if="stat.subLabel && summary" class="text-xs text-gray-400 mt-1 hidden sm:block">
              완료: {{ summary.todos.completed }}개
            </p>
          </div>
          <div :class="[
            'w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl shadow-lg flex-shrink-0',
            stat.bgColor
          ]">
            <span class="drop-shadow-sm">{{ stat.icon }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <!-- Today's Schedule -->
      <div class="card animate-slide-up" style="animation-delay: 400ms">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <h3 class="text-base sm:text-lg font-display font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span class="text-sm sm:text-lg">📅</span>
            </div>
            <span>오늘의 일정</span>
          </h3>
          <span class="badge badge-primary text-xs">{{ summary?.schedules.today.length || 0 }}</span>
        </div>

        <div v-if="summary?.schedules.today.length" class="space-y-2 sm:space-y-3">
          <div
            v-for="(schedule, index) in summary.schedules.today"
            :key="schedule.id"
            class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-transparent border border-gray-100 rounded-xl animate-slide-in"
            :style="{ animationDelay: `${500 + index * 100}ms` }"
          >
            <div class="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg self-start">
              {{ formatTime(schedule.start_time) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-800 truncate text-sm sm:text-base">{{ schedule.title }}</div>
              <div v-if="schedule.location" class="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <span>📍</span>
                <span class="truncate">{{ schedule.location }}</span>
              </div>
            </div>
            <div class="flex gap-1.5 flex-wrap">
              <span
                v-for="tag in schedule.tags?.slice(0, 2)"
                :key="tag"
                class="tag tag-gray text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="empty-state py-8 sm:py-12">
          <div class="text-3xl sm:text-5xl mb-2 sm:mb-4 opacity-50">🌴</div>
          <p class="text-gray-500 text-sm sm:text-base">오늘 예정된 일정이 없어요</p>
          <p class="text-xs sm:text-sm text-gray-400 mt-1">여유로운 하루 보내세요!</p>
        </div>
      </div>

      <!-- Quick Stats / Due Today -->
      <div class="space-y-4 sm:space-y-6">
        <!-- Due Today Alert -->
        <div 
          v-if="summary?.todos.dueToday && summary.todos.dueToday > 0" 
          class="card border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/80 to-white/80 animate-slide-up"
          style="animation-delay: 450ms"
        >
          <div class="flex items-center gap-3 sm:gap-4">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0">
              <span class="text-lg sm:text-xl">⚠️</span>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-gray-800 text-sm sm:text-base">오늘 마감</h3>
              <p class="text-red-600 text-sm sm:text-base">
                <strong class="text-lg sm:text-xl">{{ summary.todos.dueToday }}개</strong>의 할 일이 오늘 마감!
              </p>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card animate-slide-up" style="animation-delay: 500ms">
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <h3 class="text-base sm:text-lg font-display font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <span class="text-sm sm:text-lg">📊</span>
              </div>
              <span>전체 현황</span>
            </h3>
          </div>

          <div class="space-y-2 sm:space-y-4">
            <div class="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">
              <div class="flex items-center gap-2 sm:gap-3">
                <div class="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📝</div>
                <span class="font-medium text-gray-700 text-sm sm:text-base">총 메모</span>
              </div>
              <span class="text-lg sm:text-xl font-bold text-gray-900">{{ summary?.memos.total || 0 }}</span>
            </div>
            
            <div class="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">
              <div class="flex items-center gap-2 sm:gap-3">
                <div class="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">✅</div>
                <span class="font-medium text-gray-700 text-sm sm:text-base">완료된 할 일</span>
              </div>
              <span class="text-lg sm:text-xl font-bold text-emerald-600">{{ summary?.todos.completed || 0 }}</span>
            </div>

            <div class="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">
              <div class="flex items-center gap-2 sm:gap-3">
                <div class="w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center text-sm">⏳</div>
                <span class="font-medium text-gray-700 text-sm sm:text-base">남은 할 일</span>
              </div>
              <span class="text-lg sm:text-xl font-bold text-amber-600">{{ summary?.todos.incomplete || 0 }}</span>
            </div>

            <div class="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">
              <div class="flex items-center gap-2 sm:gap-3">
                <div class="w-7 h-7 sm:w-8 sm:h-8 bg-violet-100 rounded-lg flex items-center justify-center text-sm">🔖</div>
                <span class="font-medium text-gray-700 text-sm sm:text-base">저장된 북마크</span>
              </div>
              <span class="text-lg sm:text-xl font-bold text-gray-900">{{ summary?.bookmarks.total || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
