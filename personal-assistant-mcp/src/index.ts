#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { initializeDatabase } from './database.js';

// Tools
import * as memo from './tools/memo.js';
import * as todo from './tools/todo.js';
import * as schedule from './tools/schedule.js';
import * as bookmark from './tools/bookmark.js';

// MCP 서버 생성
const server = new Server(
  {
    name: 'personal-assistant',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ==================== Tools 목록 ====================
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // 메모 관련
      {
        name: 'create_memo',
        description: '새 메모를 생성합니다',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '메모 제목' },
            content: { type: 'string', description: '메모 내용' },
            tags: { type: 'array', items: { type: 'string' }, description: '태그 목록' },
          },
          required: ['title', 'content'],
        },
      },
      {
        name: 'list_memos',
        description: '메모 목록을 조회합니다. 검색어나 태그로 필터링 가능',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '검색어' },
            tag: { type: 'string', description: '태그' },
          },
        },
      },
      {
        name: 'get_memo',
        description: '특정 메모의 상세 정보를 조회합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '메모 ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_memo',
        description: '메모를 수정합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '메모 ID' },
            title: { type: 'string', description: '새 제목' },
            content: { type: 'string', description: '새 내용' },
            tags: { type: 'array', items: { type: 'string' }, description: '새 태그' },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_memo',
        description: '메모를 삭제합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '메모 ID' },
          },
          required: ['id'],
        },
      },

      // 할 일 관련
      {
        name: 'create_todo',
        description: '새 할 일을 생성합니다',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '할 일 제목' },
            description: { type: 'string', description: '상세 설명' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], description: '우선순위' },
            due_date: { type: 'string', description: '마감일 (YYYY-MM-DD)' },
            tags: { type: 'array', items: { type: 'string' }, description: '태그' },
          },
          required: ['title'],
        },
      },
      {
        name: 'list_todos',
        description: '할 일 목록을 조회합니다',
        inputSchema: {
          type: 'object',
          properties: {
            completed: { type: 'boolean', description: '완료 여부로 필터링' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], description: '우선순위로 필터링' },
            tag: { type: 'string', description: '태그로 필터링' },
          },
        },
      },
      {
        name: 'get_todo',
        description: '특정 할 일의 상세 정보를 조회합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '할 일 ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_todo',
        description: '할 일을 수정합니다 (완료 처리 포함)',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '할 일 ID' },
            title: { type: 'string', description: '새 제목' },
            description: { type: 'string', description: '새 설명' },
            completed: { type: 'boolean', description: '완료 여부' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], description: '우선순위' },
            due_date: { type: 'string', description: '마감일' },
            tags: { type: 'array', items: { type: 'string' }, description: '태그' },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_todo',
        description: '할 일을 삭제합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '할 일 ID' },
          },
          required: ['id'],
        },
      },

      // 일정 관련
      {
        name: 'create_schedule',
        description: '새 일정을 생성합니다',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: '일정 제목' },
            description: { type: 'string', description: '상세 설명' },
            start_time: { type: 'string', description: '시작 시간 (YYYY-MM-DD HH:mm)' },
            end_time: { type: 'string', description: '종료 시간 (YYYY-MM-DD HH:mm)' },
            location: { type: 'string', description: '장소' },
            tags: { type: 'array', items: { type: 'string' }, description: '태그' },
          },
          required: ['title', 'start_time'],
        },
      },
      {
        name: 'list_schedules',
        description: '일정 목록을 조회합니다',
        inputSchema: {
          type: 'object',
          properties: {
            date: { type: 'string', description: '특정 날짜 (YYYY-MM-DD)' },
            from_date: { type: 'string', description: '시작 날짜' },
            to_date: { type: 'string', description: '종료 날짜' },
            tag: { type: 'string', description: '태그로 필터링' },
          },
        },
      },
      {
        name: 'get_schedule',
        description: '특정 일정의 상세 정보를 조회합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '일정 ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_schedule',
        description: '일정을 수정합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '일정 ID' },
            title: { type: 'string', description: '새 제목' },
            description: { type: 'string', description: '새 설명' },
            start_time: { type: 'string', description: '새 시작 시간' },
            end_time: { type: 'string', description: '새 종료 시간' },
            location: { type: 'string', description: '새 장소' },
            tags: { type: 'array', items: { type: 'string' }, description: '새 태그' },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_schedule',
        description: '일정을 삭제합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '일정 ID' },
          },
          required: ['id'],
        },
      },

      // 북마크 관련
      {
        name: 'create_bookmark',
        description: '새 북마크를 생성합니다',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL' },
            title: { type: 'string', description: '제목' },
            description: { type: 'string', description: '설명' },
            tags: { type: 'array', items: { type: 'string' }, description: '태그' },
          },
          required: ['url', 'title'],
        },
      },
      {
        name: 'list_bookmarks',
        description: '북마크 목록을 조회합니다',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '검색어' },
            tag: { type: 'string', description: '태그로 필터링' },
          },
        },
      },
      {
        name: 'get_bookmark',
        description: '특정 북마크의 상세 정보를 조회합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '북마크 ID' },
          },
          required: ['id'],
        },
      },
      {
        name: 'update_bookmark',
        description: '북마크를 수정합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '북마크 ID' },
            url: { type: 'string', description: '새 URL' },
            title: { type: 'string', description: '새 제목' },
            description: { type: 'string', description: '새 설명' },
            tags: { type: 'array', items: { type: 'string' }, description: '새 태그' },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_bookmark',
        description: '북마크를 삭제합니다',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: '북마크 ID' },
          },
          required: ['id'],
        },
      },

      // 통합 기능
      {
        name: 'search_all',
        description: '모든 데이터(메모, 할 일, 일정, 북마크)에서 통합 검색합니다',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '검색어' },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_today_summary',
        description: '오늘의 요약 정보를 가져옵니다 (오늘 일정, 마감 할 일, 최근 메모)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// ==================== Tools 실행 ====================
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // 메모
      case 'create_memo': {
        const result = await memo.createMemo(
          args?.title as string,
          args?.content as string,
          args?.tags as string[] | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'list_memos': {
        const result = await memo.listMemos(args?.query as string, args?.tag as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_memo': {
        const result = await memo.getMemo(args?.id as number);
        if (!result) {
          return { content: [{ type: 'text', text: '메모를 찾을 수 없습니다.' }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'update_memo': {
        const result = await memo.updateMemo(
          args?.id as number,
          args?.title as string | undefined,
          args?.content as string | undefined,
          args?.tags as string[] | undefined
        );
        if (!result) {
          return { content: [{ type: 'text', text: '메모를 찾을 수 없습니다.' }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'delete_memo': {
        const success = await memo.deleteMemo(args?.id as number);
        return {
          content: [{ type: 'text', text: success ? '메모가 삭제되었습니다.' : '메모를 찾을 수 없습니다.' }],
          isError: !success,
        };
      }

      // 할 일
      case 'create_todo': {
        const result = await todo.createTodo(
          args?.title as string,
          args?.description as string | undefined,
          args?.priority as string | undefined,
          args?.due_date as string | undefined,
          args?.tags as string[] | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'list_todos': {
        const result = await todo.listTodos(
          args?.completed as boolean | undefined,
          args?.priority as string | undefined,
          args?.tag as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_todo': {
        const result = await todo.getTodo(args?.id as number);
        if (!result) {
          return { content: [{ type: 'text', text: '할 일을 찾을 수 없습니다.' }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'update_todo': {
        const result = await todo.updateTodo(
          args?.id as number,
          args?.title as string | undefined,
          args?.description as string | undefined,
          args?.completed as boolean | undefined,
          args?.priority as string | undefined,
          args?.due_date as string | undefined,
          args?.tags as string[] | undefined
        );
        if (!result) {
          return { content: [{ type: 'text', text: '할 일을 찾을 수 없습니다.' }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'delete_todo': {
        const success = await todo.deleteTodo(args?.id as number);
        return {
          content: [{ type: 'text', text: success ? '할 일이 삭제되었습니다.' : '할 일을 찾을 수 없습니다.' }],
          isError: !success,
        };
      }

      // 일정
      case 'create_schedule': {
        const result = await schedule.createSchedule(
          args?.title as string,
          args?.start_time as string,
          args?.description as string | undefined,
          args?.end_time as string | undefined,
          args?.location as string | undefined,
          args?.tags as string[] | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'list_schedules': {
        const result = await schedule.listSchedules(
          args?.date as string | undefined,
          args?.from_date as string | undefined,
          args?.to_date as string | undefined,
          args?.tag as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_schedule': {
        const result = await schedule.getSchedule(args?.id as number);
        if (!result) {
          return { content: [{ type: 'text', text: '일정을 찾을 수 없습니다.' }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'update_schedule': {
        const result = await schedule.updateSchedule(
          args?.id as number,
          args?.title as string | undefined,
          args?.description as string | undefined,
          args?.start_time as string | undefined,
          args?.end_time as string | undefined,
          args?.location as string | undefined,
          args?.tags as string[] | undefined
        );
        if (!result) {
          return { content: [{ type: 'text', text: '일정을 찾을 수 없습니다.' }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'delete_schedule': {
        const success = await schedule.deleteSchedule(args?.id as number);
        return {
          content: [{ type: 'text', text: success ? '일정이 삭제되었습니다.' : '일정을 찾을 수 없습니다.' }],
          isError: !success,
        };
      }

      // 북마크
      case 'create_bookmark': {
        const result = await bookmark.createBookmark(
          args?.url as string,
          args?.title as string,
          args?.description as string | undefined,
          args?.tags as string[] | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'list_bookmarks': {
        const result = await bookmark.listBookmarks(args?.query as string, args?.tag as string);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_bookmark': {
        const result = await bookmark.getBookmark(args?.id as number);
        if (!result) {
          return { content: [{ type: 'text', text: '북마크를 찾을 수 없습니다.' }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'update_bookmark': {
        const result = await bookmark.updateBookmark(
          args?.id as number,
          args?.url as string | undefined,
          args?.title as string | undefined,
          args?.description as string | undefined,
          args?.tags as string[] | undefined
        );
        if (!result) {
          return { content: [{ type: 'text', text: '북마크를 찾을 수 없습니다.' }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'delete_bookmark': {
        const success = await bookmark.deleteBookmark(args?.id as number);
        return {
          content: [{ type: 'text', text: success ? '북마크가 삭제되었습니다.' : '북마크를 찾을 수 없습니다.' }],
          isError: !success,
        };
      }

      // 통합 기능
      case 'search_all': {
        const searchQuery = args?.query as string;
        const [memos, todos, schedules, bookmarks] = await Promise.all([
          memo.listMemos(searchQuery),
          todo.listTodos(),
          schedule.listSchedules(),
          bookmark.listBookmarks(searchQuery),
        ]);
        
        const results = {
          memos,
          todos: todos.filter(
            (t) => t.title.includes(searchQuery) || t.description.includes(searchQuery)
          ),
          schedules: schedules.filter(
            (s) => s.title.includes(searchQuery) || s.description.includes(searchQuery)
          ),
          bookmarks,
        };
        return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
      }

      case 'get_today_summary': {
        const today = new Date().toISOString().split('T')[0];
        const [todaySchedules, dueTodos, incompleteTodoCount, recentMemos, bookmarkCount] = await Promise.all([
          schedule.getTodaySchedules(),
          todo.getTodayTodos(),
          todo.getIncompleteTodoCount(),
          memo.listMemos(),
          bookmark.getBookmarkCount(),
        ]);
        
        const summary = {
          date: today,
          todaySchedules,
          dueTodos,
          incompleteTodoCount,
          recentMemos: recentMemos.slice(0, 5),
          bookmarkCount,
        };
        return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text', text: `알 수 없는 도구: ${name}` }], isError: true };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `오류 발생: ${errorMessage}` }], isError: true };
  }
});

// ==================== Resources 목록 ====================
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'assistant://summary/today',
        name: '오늘의 요약',
        description: '오늘의 일정, 할 일, 최근 메모 요약',
        mimeType: 'application/json',
      },
      {
        uri: 'assistant://todos/incomplete',
        name: '미완료 할 일',
        description: '완료되지 않은 모든 할 일 목록',
        mimeType: 'application/json',
      },
      {
        uri: 'assistant://schedules/week',
        name: '이번 주 일정',
        description: '이번 주 전체 일정',
        mimeType: 'application/json',
      },
    ],
  };
});

// ==================== Resources 읽기 ====================
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'assistant://summary/today': {
      const today = new Date().toISOString().split('T')[0];
      const [todaySchedules, dueTodos, incompleteTodoCount, recentMemos, bookmarkCount] = await Promise.all([
        schedule.getTodaySchedules(),
        todo.getTodayTodos(),
        todo.getIncompleteTodoCount(),
        memo.listMemos(),
        bookmark.getBookmarkCount(),
      ]);
      
      const summary = {
        date: today,
        todaySchedules,
        dueTodos,
        incompleteTodoCount,
        recentMemos: recentMemos.slice(0, 5),
        bookmarkCount,
      };
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    }

    case 'assistant://todos/incomplete': {
      const incompleteTodos = await todo.listTodos(false);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(incompleteTodos, null, 2),
          },
        ],
      };
    }

    case 'assistant://schedules/week': {
      const weekSchedules = await schedule.getThisWeekSchedules();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(weekSchedules, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`알 수 없는 리소스: ${uri}`);
  }
});

// ==================== 서버 시작 ====================
async function main() {
  // 데이터베이스 초기화
  await initializeDatabase();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Personal Assistant MCP] 서버가 시작되었습니다 (PostgreSQL)');
}

main().catch((error) => {
  console.error('[Personal Assistant MCP] 서버 시작 실패:', error);
  process.exit(1);
});
