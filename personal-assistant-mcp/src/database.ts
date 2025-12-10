import pg from 'pg';

const { Pool } = pg;

// PostgreSQL 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'personal_assistant',
  user: process.env.DB_USER || 'assistant',
  password: process.env.DB_PASSWORD || 'assistant123',
});

// 연결 테스트 및 초기화
export async function initializeDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    console.error('[Database] PostgreSQL 연결 성공');
    client.release();
  } catch (error) {
    console.error('[Database] PostgreSQL 연결 실패:', error);
    throw error;
  }
}

// 쿼리 실행 헬퍼
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

// 단일 행 조회 헬퍼
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | undefined> {
  const result = await pool.query(text, params);
  return result.rows[0] as T | undefined;
}

// INSERT 후 반환 헬퍼
export async function queryInsert<T = any>(text: string, params?: any[]): Promise<T> {
  const result = await pool.query(text, params);
  return result.rows[0] as T;
}

// 연결 풀 종료
export async function closeDatabase(): Promise<void> {
  await pool.end();
  console.error('[Database] PostgreSQL 연결 종료');
}

export default pool;
