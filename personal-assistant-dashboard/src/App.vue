<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSummary, type Summary } from './api';
import Sidebar from './components/Sidebar.vue';
import Dashboard from './views/Dashboard.vue';
import Memos from './views/Memos.vue';
import Todos from './views/Todos.vue';
import Schedules from './views/Schedules.vue';
import Bookmarks from './views/Bookmarks.vue';

const currentView = ref<'dashboard' | 'memos' | 'todos' | 'schedules' | 'bookmarks'>('dashboard');
const summary = ref<Summary | null>(null);

const loadSummary = async () => {
  try {
    summary.value = await getSummary();
  } catch (error) {
    console.error('Failed to load summary:', error);
  }
};

onMounted(loadSummary);
</script>

<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <Sidebar 
      :current-view="currentView" 
      :summary="summary"
      @navigate="currentView = $event" 
    />
    
    <!-- Main Content -->
    <main class="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100">
      <!-- Background decorations -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/20 rounded-full filter blur-3xl"></div>
        <div class="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-200/20 rounded-full filter blur-3xl"></div>
      </div>
      
      <div class="relative p-8 lg:p-10">
        <Dashboard v-if="currentView === 'dashboard'" :summary="summary" @refresh="loadSummary" />
        <Memos v-else-if="currentView === 'memos'" @update="loadSummary" />
        <Todos v-else-if="currentView === 'todos'" @update="loadSummary" />
        <Schedules v-else-if="currentView === 'schedules'" @update="loadSummary" />
        <Bookmarks v-else-if="currentView === 'bookmarks'" @update="loadSummary" />
      </div>
    </main>
  </div>
</template>
