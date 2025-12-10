import { z } from 'zod';
import { query, queryOne, queryInsert } from '../database.js';

// 스키마 정의
export const CreateMemoSchema = z.object({
  title: z.string().describe('메모 제목'),
  content: z.string().describe('메모 내용'),
  tags: z.array(z.string()).optional().describe('태그 목록'),
});

export const UpdateMemoSchema = z.object({
  id: z.number().describe('메모 ID'),
  title: z.string().optional().describe('새 제목'),
  content: z.string().optional().describe('새 내용'),
  tags: z.array(z.string()).optional().describe('새 태그 목록'),
});

export const DeleteMemoSchema = z.object({
  id: z.number().describe('삭제할 메모 ID'),
});

export const SearchMemoSchema = z.object({
  query: z.string().optional().describe('검색어 (제목, 내용에서 검색)'),
  tag: z.string().optional().describe('태그로 필터링'),
});

// 타입 정의
export interface Memo {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

// 메모 생성
export async function createMemo(title: string, content: string, tags: string[] = []): Promise<Memo> {
  const result = await queryInsert<Memo>(
    `INSERT INTO memos (title, content, tags)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [title, content, tags]
  );
  return result;
}

// 메모 목록 조회
export async function listMemos(searchQuery?: string, tag?: string): Promise<Memo[]> {
  let sql = 'SELECT * FROM memos WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (searchQuery) {
    sql += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex + 1})`;
    params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    paramIndex += 2;
  }

  if (tag) {
    sql += ` AND $${paramIndex} = ANY(tags)`;
    params.push(tag);
    paramIndex += 1;
  }

  sql += ' ORDER BY updated_at DESC';

  return await query<Memo>(sql, params);
}

// 메모 상세 조회
export async function getMemo(id: number): Promise<Memo | undefined> {
  return await queryOne<Memo>('SELECT * FROM memos WHERE id = $1', [id]);
}

// 메모 수정
export async function updateMemo(
  id: number,
  title?: string,
  content?: string,
  tags?: string[]
): Promise<Memo | undefined> {
  const memo = await getMemo(id);
  if (!memo) return undefined;

  const newTitle = title ?? memo.title;
  const newContent = content ?? memo.content;
  const newTags = tags ?? memo.tags;

  return await queryOne<Memo>(
    `UPDATE memos 
     SET title = $1, content = $2, tags = $3
     WHERE id = $4
     RETURNING *`,
    [newTitle, newContent, newTags, id]
  );
}

// 메모 삭제
export async function deleteMemo(id: number): Promise<boolean> {
  const result = await query('DELETE FROM memos WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}
