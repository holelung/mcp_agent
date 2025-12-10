<script setup lang="ts">
import type { Summary } from '../api';

defineProps<{
  currentView: string;
  summary: Summary | null;
}>();

const emit = defineEmits<{
  navigate: [view: string];
  close: [];
}>();

const menuItems = [
  { id: 'dashboard', icon: '📊', label: '대시보드', gradient: 'from-violet-500 to-purple-500' },
  { id: 'memos', icon: '📝', label: '메모', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'todos', icon: '✅', label: '할 일', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'schedules', icon: '📅', label: '일정', gradient: 'from-orange-500 to-amber-500' },
  { id: 'bookmarks', icon: '🔖', label: '북마크', gradient: 'from-pink-500 to-rose-500' },
];
</script>

<template>
  <aside class="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-20">
      <div class="absolute top-0 left-0 w-64 h-64 bg-primary-500 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-48 h-48 bg-violet-500 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </div>

    <!-- Logo -->
    <div class="relative p-6 border-b border-white/10">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span class="text-2xl">🤖</span>
          </div>
          <div>
            <h1 class="text-xl font-display font-bold text-white">Personal</h1>
            <h1 class="text-xl font-display font-bold bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">Assistant</h1>
          </div>
        </div>
        
        <!-- Close Button (Mobile) -->
        <button
          @click="emit('close')"
          class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Navigation -->
    <nav class="relative flex-1 p-4 overflow-y-auto">
      <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">
        메뉴
      </div>
      <ul class="space-y-2">
        <li v-for="(item, index) in menuItems" :key="item.id" class="animate-slide-in" :style="{ animationDelay: `${index * 50}ms` }">
          <button
            @click="emit('navigate', item.id)"
            :class="[
              'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative',
              currentView === item.id
                ? 'bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur-sm border border-white/10'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            ]"
          >
            <div :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300',
              currentView === item.id
                ? `bg-gradient-to-br ${item.gradient} shadow-lg`
                : 'bg-slate-700/50 group-hover:bg-slate-600/50'
            ]">
              {{ item.icon }}
            </div>
            <span class="font-semibold text-[15px]">{{ item.label }}</span>
            
            <!-- Badge for incomplete todos -->
            <span
              v-if="summary && item.id === 'todos' && summary.todos.incomplete > 0"
              class="ml-auto badge badge-danger animate-pulse-soft"
            >
              {{ summary.todos.incomplete }}
            </span>

            <!-- Active indicator -->
            <div
              v-if="currentView === item.id"
              class="absolute right-0 w-1 h-8 bg-gradient-to-b from-primary-400 to-violet-400 rounded-l-full"
            ></div>
          </button>
        </li>
      </ul>
    </nav>
    
    <!-- Footer -->
    <div class="relative p-4 border-t border-white/10">
      <div class="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/20">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span class="text-white text-sm">⚡</span>
          </div>
          <div>
            <div class="text-sm font-semibold text-white">MCP 연동됨</div>
            <div class="text-xs text-slate-400">PostgreSQL + Vue</div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
