import { z } from 'zod';
import { query, queryOne, queryInsert } from '../database.js';

// 스키마 정의
export const CreateScheduleSchema = z.object({
  title: z.string().describe('일정 제목'),
  description: z.string().optional().describe('상세 설명'),
  start_time: z.string().describe('시작 시간 (YYYY-MM-DD HH:mm 형식)'),
  end_time: z.string().optional().describe('종료 시간 (YYYY-MM-DD HH:mm 형식)'),
  location: z.string().optional().describe('장소'),
  tags: z.array(z.string()).optional().describe('태그 목록'),
});

export const UpdateScheduleSchema = z.object({
  id: z.number().describe('일정 ID'),
  title: z.string().optional().describe('새 제목'),
  description: z.string().optional().describe('새 설명'),
  start_time: z.string().optional().describe('새 시작 시간'),
  end_time: z.string().optional().describe('새 종료 시간'),
  location: z.string().optional().describe('새 장소'),
  tags: z.array(z.string()).optional().describe('새 태그 목록'),
});

export const DeleteScheduleSchema = z.object({
  id: z.number().describe('삭제할 일정 ID'),
});

export const ListScheduleSchema = z.object({
  date: z.string().optional().describe('특정 날짜 (YYYY-MM-DD 형식)'),
  from_date: z.string().optional().describe('시작 날짜 범위'),
  to_date: z.string().optional().describe('종료 날짜 범위'),
  tag: z.string().optional().describe('태그로 필터링'),
});

// 타입 정의
export interface Schedule {
  id: number;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date | null;
  location: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

// 일정 생성
export async function createSchedule(
  title: string,
  start_time: string,
  description: string = '',
  end_time?: string,
  location: string = '',
  tags: string[] = []
): Promise<Schedule> {
  const result = await queryInsert<Schedule>(
    `INSERT INTO schedules (title, description, start_time, end_time, location, tags)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title, description, start_time, end_time || null, location, tags]
  );
  return result;
}

// 일정 목록 조회
export async function listSchedules(
  date?: string,
  from_date?: string,
  to_date?: string,
  tag?: string
): Promise<Schedule[]> {
  let sql = 'SELECT * FROM schedules WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (date) {
    sql += ` AND DATE(start_time) = $${paramIndex}`;
    params.push(date);
    paramIndex += 1;
  }

  if (from_date) {
    sql += ` AND DATE(start_time) >= $${paramIndex}`;
    params.push(from_date);
    paramIndex += 1;
  }

  if (to_date) {
    sql += ` AND DATE(start_time) <= $${paramIndex}`;
    params.push(to_date);
    paramIndex += 1;
  }

  if (tag) {
    sql += ` AND $${paramIndex} = ANY(tags)`;
    params.push(tag);
    paramIndex += 1;
  }

  sql += ' ORDER BY start_time ASC';

  return await query<Schedule>(sql, params);
}

// 일정 상세 조회
export async function getSchedule(id: number): Promise<Schedule | undefined> {
  return await queryOne<Schedule>('SELECT * FROM schedules WHERE id = $1', [id]);
}

// 일정 수정
export async function updateSchedule(
  id: number,
  title?: string,
  description?: string,
  start_time?: string,
  end_time?: string,
  location?: string,
  tags?: string[]
): Promise<Schedule | undefined> {
  const schedule = await getSchedule(id);
  if (!schedule) return undefined;

  const newTitle = title ?? schedule.title;
  const newDescription = description ?? schedule.description;
  const newStartTime = start_time ?? schedule.start_time;
  const newEndTime = end_time !== undefined ? end_time : schedule.end_time;
  const newLocation = location ?? schedule.location;
  const newTags = tags ?? schedule.tags;

  return await queryOne<Schedule>(
    `UPDATE schedules 
     SET title = $1, description = $2, start_time = $3, end_time = $4, location = $5, tags = $6
     WHERE id = $7
     RETURNING *`,
    [newTitle, newDescription, newStartTime, newEndTime, newLocation, newTags, id]
  );
}

// 일정 삭제
export async function deleteSchedule(id: number): Promise<boolean> {
  const result = await query('DELETE FROM schedules WHERE id = $1 RETURNING id', [id]);
  return result.length > 0;
}

// 오늘 일정 조회
export async function getTodaySchedules(): Promise<Schedule[]> {
  return await query<Schedule>(
    'SELECT * FROM schedules WHERE DATE(start_time) = CURRENT_DATE ORDER BY start_time ASC'
  );
}

// 이번 주 일정 조회
export async function getThisWeekSchedules(): Promise<Schedule[]> {
  return await query<Schedule>(
    `SELECT * FROM schedules 
     WHERE DATE(start_time) >= DATE_TRUNC('week', CURRENT_DATE)
       AND DATE(start_time) < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
     ORDER BY start_time ASC`
  );
}
