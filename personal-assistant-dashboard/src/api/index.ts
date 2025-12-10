const API_BASE = '';

// Types
export interface Memo {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  location: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: number;
  url: string;
  title: string;
  description: string;
  tags: string[];
  created_at: string;
}

export interface Summary {
  date: string;
  memos: { total: number };
  todos: { incomplete: number; completed: number; dueToday: number };
  schedules: { today: Schedule[] };
  bookmarks: { total: number };
}

// API functions
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// Summary
export const getSummary = () => fetchJson<Summary>('/api/summary');

// Memos
export const getMemos = (query?: string, tag?: string) => {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (tag) params.set('tag', tag);
  return fetchJson<Memo[]>(`/api/memos?${params}`);
};
export const getMemo = (id: number) => fetchJson<Memo>(`/api/memos/${id}`);
export const createMemo = (data: Partial<Memo>) => 
  fetchJson<Memo>('/api/memos', { method: 'POST', body: JSON.stringify(data) });
export const updateMemo = (id: number, data: Partial<Memo>) => 
  fetchJson<Memo>(`/api/memos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMemo = (id: number) => 
  fetchJson<{ success: boolean }>(`/api/memos/${id}`, { method: 'DELETE' });

// Todos
export const getTodos = (completed?: boolean, priority?: string, tag?: string) => {
  const params = new URLSearchParams();
  if (completed !== undefined) params.set('completed', String(completed));
  if (priority) params.set('priority', priority);
  if (tag) params.set('tag', tag);
  return fetchJson<Todo[]>(`/api/todos?${params}`);
};
export const getTodo = (id: number) => fetchJson<Todo>(`/api/todos/${id}`);
export const createTodo = (data: Partial<Todo>) => 
  fetchJson<Todo>('/api/todos', { method: 'POST', body: JSON.stringify(data) });
export const updateTodo = (id: number, data: Partial<Todo>) => 
  fetchJson<Todo>(`/api/todos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTodo = (id: number) => 
  fetchJson<{ success: boolean }>(`/api/todos/${id}`, { method: 'DELETE' });

// Schedules
export const getSchedules = (date?: string, fromDate?: string, toDate?: string, tag?: string) => {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (fromDate) params.set('from_date', fromDate);
  if (toDate) params.set('to_date', toDate);
  if (tag) params.set('tag', tag);
  return fetchJson<Schedule[]>(`/api/schedules?${params}`);
};
export const getSchedule = (id: number) => fetchJson<Schedule>(`/api/schedules/${id}`);
export const createSchedule = (data: Partial<Schedule>) => 
  fetchJson<Schedule>('/api/schedules', { method: 'POST', body: JSON.stringify(data) });
export const updateSchedule = (id: number, data: Partial<Schedule>) => 
  fetchJson<Schedule>(`/api/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSchedule = (id: number) => 
  fetchJson<{ success: boolean }>(`/api/schedules/${id}`, { method: 'DELETE' });

// Bookmarks
export const getBookmarks = (query?: string, tag?: string) => {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (tag) params.set('tag', tag);
  return fetchJson<Bookmark[]>(`/api/bookmarks?${params}`);
};
export const getBookmark = (id: number) => fetchJson<Bookmark>(`/api/bookmarks/${id}`);
export const createBookmark = (data: Partial<Bookmark>) => 
  fetchJson<Bookmark>('/api/bookmarks', { method: 'POST', body: JSON.stringify(data) });
export const updateBookmark = (id: number, data: Partial<Bookmark>) => 
  fetchJson<Bookmark>(`/api/bookmarks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBookmark = (id: number) => 
  fetchJson<{ success: boolean }>(`/api/bookmarks/${id}`, { method: 'DELETE' });

