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
export async function initializeDatabase() {
    try {
        const client = await pool.connect();
        console.error('[Database] PostgreSQL 연결 성공');
        client.release();
    }
    catch (error) {
        console.error('[Database] PostgreSQL 연결 실패:', error);
        throw error;
    }
}
// 쿼리 실행 헬퍼
export async function query(text, params) {
    const result = await pool.query(text, params);
    return result.rows;
}
// 단일 행 조회 헬퍼
export async function queryOne(text, params) {
    const result = await pool.query(text, params);
    return result.rows[0];
}
// INSERT 후 반환 헬퍼
export async function queryInsert(text, params) {
    const result = await pool.query(text, params);
    return result.rows[0];
}
// 연결 풀 종료
export async function closeDatabase() {
    await pool.end();
    console.error('[Database] PostgreSQL 연결 종료');
}
export default pool;
//# sourceMappingURL=database.js.map