<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getSummary, type Summary } from './api';
import Sidebar from './components/Sidebar.vue';
import Dashboard from './views/Dashboard.vue';
import Memos from './views/Memos.vue';
import Todos from './views/Todos.vue';
import Schedules from './views/Schedules.vue';
import Bookmarks from './views/Bookmarks.vue';

const currentView = ref<'dashboard' | 'memos' | 'todos' | 'schedules' | 'bookmarks'>('dashboard');
const summary = ref<Summary | null>(null);
const sidebarOpen = ref(false);

const loadSummary = async () => {
  try {
    summary.value = await getSummary();
  } catch (error) {
    console.error('Failed to load summary:', error);
  }
};

const handleNavigate = (view: string) => {
  currentView.value = view as typeof currentView.value;
  sidebarOpen.value = false; // 모바일에서 메뉴 선택 시 사이드바 닫기
};

// 화면 크기 변경 시 사이드바 상태 리셋
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    sidebarOpen.value = false;
  }
};

onMounted(() => {
  loadSummary();
  window.addEventListener('resize', handleResize);
});
</script>

<template>
  <div class="flex h-screen">
    <!-- Mobile Menu Button -->
    <button
      @click="sidebarOpen = true"
      class="lg:hidden fixed top-4 left-4 z-40 w-12 h-12 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-slate-800 transition-colors"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Mobile Overlay -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
        class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      ></div>
    </Transition>

    <!-- Sidebar -->
    <Transition name="slide">
      <Sidebar
        v-show="sidebarOpen || true"
        :current-view="currentView"
        :summary="summary"
        :class="[
          'fixed lg:relative z-50 h-full',
          'transition-transform duration-300 ease-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
        @navigate="handleNavigate"
        @close="sidebarOpen = false"
      />
    </Transition>
    
    <!-- Main Content -->
    <main class="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100">
      <!-- Background decorations -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/20 rounded-full filter blur-3xl"></div>
        <div class="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-200/20 rounded-full filter blur-3xl"></div>
      </div>
      
      <div class="relative p-4 pt-20 lg:pt-8 lg:p-10">
        <Dashboard v-if="currentView === 'dashboard'" :summary="summary" @refresh="loadSummary" />
        <Memos v-else-if="currentView === 'memos'" @update="loadSummary" />
        <Todos v-else-if="currentView === 'todos'" @update="loadSummary" />
        <Schedules v-else-if="currentView === 'schedules'" @update="loadSummary" />
        <Bookmarks v-else-if="currentView === 'bookmarks'" @update="loadSummary" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
