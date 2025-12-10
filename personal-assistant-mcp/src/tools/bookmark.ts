import { z } from 'zod';
import { query, queryOne, queryInsert } from '../database.js';

// 스키마 정의
export const CreateBookmarkSchema = z.object({
  url: z.string().url().describe('북마크할 URL'),
  title: z.string().describe('북마크 제목'),
  description: z.string().optional().describe('설명'),
  tags: z.array(z.string()).optional().describe('태그 목록'),
});

export const UpdateBookmarkSchema = z.object({
  id: z.number().describe('북마크 ID'),
  url: z.string().url().optional().describe('새 URL'),
  title: z.string().optional().describe('새 제목'),
  description: z.string().optional().describe('새 설명'),
  tags: z.array(z.string()).optional().describe('새 태그 목록'),
});

export const DeleteBookmarkSchema = z.object({
  id: z.number().describe('삭제할 북마크 ID'),
});

export const SearchBookmarkSchema = z.object({
  query: z.string().optional().describe('검색어 (제목, 설명, URL에서 검색)'),
  tag: z.string().optional().describe('태그로 필터링'),
});

// 타입 정의
export interface Bookmark {
  id: number;
  url: string;
  title: string;
  description: string;
  tags: string[];
  created_at: Date;
}

// 북마크 생성
export async function createBookmark(
  url: string,
  title: string,
  description: string = '',
  tags: string[] = []
): Promise<Bookmark> {
  const result = await queryInsert<Bookmark>(
    `INSERT INTO bookmarks (url, title, description, tags)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [url, title, description, tags]
  );
  return result;
}

// 북마크 목록 조회
export async function listBookmarks(searchQuery?: string, tag?: string): Promise<Bookmark[]> {
  let sql = 'SELECT * FROM bookmarks WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (searchQuery) {
    sql += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1} OR url ILIKE $${paramIndex + 2})`;
    params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
    paramIndex += 3;
  }

  if (tag) {
    sql += ` AND $${paramIndex} = ANY(tags)`;
    params.push(tag);
    paramIndex += 1;
  }

  sql += ' ORDER BY created_at DESC';

  return await query<Bookmark>(sql, params);
}

// 북마크 상세 조회
export async function getBookmark(id: number): Promise<Bookmark | undefined> {
  return await queryOne<Bookmark>('SELECT * FROM bookmarks WHERE id = $1', [id]);
}

// 북마크 수정
export async function updateBookmark(
  id: number,
  url?: string,
  title?: string,
  description?: string,
  tags?: string[]
): Promise<Bookmark | undefined> {
  const bookmark = await getBookmark(id);
  if (!bookmark) return undefined;

  const newUrl = url ?? bookmark.url;
  const newTitle = title ?? bookmark.title;
  const newDescription = description ?? bookmark.description;
  const newTags = tags ?? bookmark.tags;

  return await queryOne<Bookmark>(
    `UPDATE bookmarks 
     SET url = $1, title = $2, description = $3, tags = $4
     WHERE id = $5
     RETURNING *`,
    [newUrl, newTitle, newDescription, newTags, id]
  );
}

// 북마크 삭제
export async function deleteBookmark(id: number): Promise<boolean> {
  const result = await query('DELETE FROM bookmarks WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}

// 북마크 개수
export async function getBookmarkCount(): Promise<number> {
  const result = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM bookmarks');
  return parseInt(result?.count || '0');
}
