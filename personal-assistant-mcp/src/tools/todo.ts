import { z } from 'zod';
import { query, queryOne, queryInsert } from '../database.js';

// 스키마 정의
export const CreateTodoSchema = z.object({
  title: z.string().describe('할 일 제목'),
  description: z.string().optional().describe('상세 설명'),
  priority: z.enum(['low', 'medium', 'high']).optional().describe('우선순위 (low, medium, high)'),
  due_date: z.string().optional().describe('마감일 (YYYY-MM-DD 형식)'),
  tags: z.array(z.string()).optional().describe('태그 목록'),
});

export const UpdateTodoSchema = z.object({
  id: z.number().describe('할 일 ID'),
  title: z.string().optional().describe('새 제목'),
  description: z.string().optional().describe('새 설명'),
  completed: z.boolean().optional().describe('완료 여부'),
  priority: z.enum(['low', 'medium', 'high']).optional().describe('우선순위'),
  due_date: z.string().optional().describe('마감일'),
  tags: z.array(z.string()).optional().describe('태그 목록'),
});

export const DeleteTodoSchema = z.object({
  id: z.number().describe('삭제할 할 일 ID'),
});

export const ListTodoSchema = z.object({
  completed: z.boolean().optional().describe('완료 여부로 필터링'),
  priority: z.enum(['low', 'medium', 'high']).optional().describe('우선순위로 필터링'),
  tag: z.string().optional().describe('태그로 필터링'),
});

// 타입 정의
export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  due_date: string | null;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

// 할 일 생성
export async function createTodo(
  title: string,
  description: string = '',
  priority: string = 'medium',
  due_date?: string,
  tags: string[] = []
): Promise<Todo> {
  const result = await queryInsert<Todo>(
    `INSERT INTO todos (title, description, priority, due_date, tags)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, description, priority, due_date || null, tags]
  );
  return result;
}

// 할 일 목록 조회
export async function listTodos(completed?: boolean, priority?: string, tag?: string): Promise<Todo[]> {
  let sql = 'SELECT * FROM todos WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (completed !== undefined) {
    sql += ` AND completed = $${paramIndex}`;
    params.push(completed);
    paramIndex += 1;
  }

  if (priority) {
    sql += ` AND priority = $${paramIndex}`;
    params.push(priority);
    paramIndex += 1;
  }

  if (tag) {
    sql += ` AND $${paramIndex} = ANY(tags)`;
    params.push(tag);
    paramIndex += 1;
  }

  sql += ` ORDER BY 
    CASE priority 
      WHEN 'high' THEN 1 
      WHEN 'medium' THEN 2 
      WHEN 'low' THEN 3 
    END, 
    due_date ASC NULLS LAST`;

  return await query<Todo>(sql, params);
}

// 할 일 상세 조회
export async function getTodo(id: number): Promise<Todo | undefined> {
  return await queryOne<Todo>('SELECT * FROM todos WHERE id = $1', [id]);
}

// 할 일 수정
export async function updateTodo(
  id: number,
  title?: string,
  description?: string,
  completed?: boolean,
  priority?: string,
  due_date?: string,
  tags?: string[]
): Promise<Todo | undefined> {
  const todo = await getTodo(id);
  if (!todo) return undefined;

  const newTitle = title ?? todo.title;
  const newDescription = description ?? todo.description;
  const newCompleted = completed ?? todo.completed;
  const newPriority = priority ?? todo.priority;
  const newDueDate = due_date !== undefined ? due_date : todo.due_date;
  const newTags = tags ?? todo.tags;

  return await queryOne<Todo>(
    `UPDATE todos 
     SET title = $1, description = $2, completed = $3, priority = $4, due_date = $5, tags = $6
     WHERE id = $7
     RETURNING *`,
    [newTitle, newDescription, newCompleted, newPriority, newDueDate, newTags, id]
  );
}

// 할 일 삭제
export async function deleteTodo(id: number): Promise<boolean> {
  const result = await query('DELETE FROM todos WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}

// 오늘 마감인 할 일 조회
export async function getTodayTodos(): Promise<Todo[]> {
  return await query<Todo>(
    'SELECT * FROM todos WHERE due_date = CURRENT_DATE AND completed = FALSE'
  );
}

// 미완료 할 일 개수
export async function getIncompleteTodoCount(): Promise<number> {
  const result = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM todos WHERE completed = FALSE');
  return parseInt(result?.count || '0');
}
