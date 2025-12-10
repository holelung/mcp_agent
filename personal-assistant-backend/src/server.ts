import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;

const app = express();
const PORT = process.env.API_PORT || 3001;

// PostgreSQL 연결
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'personal_assistant',
  user: process.env.DB_USER || 'assistant',
  password: process.env.DB_PASSWORD || 'assistant123',
});

// 미들웨어
app.use(cors());
app.use(express.json());

// ==================== 메모 API ====================
app.get('/api/memos', async (req, res) => {
  try {
    const { query, tag } = req.query;
    let sql = 'SELECT * FROM memos WHERE 1=1';
    const params: any[] = [];
    let idx = 1;

    if (query) {
      sql += ` AND (title ILIKE $${idx} OR content ILIKE $${idx + 1})`;
      params.push(`%${query}%`, `%${query}%`);
      idx += 2;
    }
    if (tag) {
      sql += ` AND $${idx} = ANY(tags)`;
      params.push(tag);
    }
    sql += ' ORDER BY updated_at DESC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/memos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM memos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/memos', async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    const result = await pool.query(
      'INSERT INTO memos (title, content, tags) VALUES ($1, $2, $3) RETURNING *',
      [title, content, tags]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/memos/:id', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const result = await pool.query(
      'UPDATE memos SET title = COALESCE($1, title), content = COALESCE($2, content), tags = COALESCE($3, tags) WHERE id = $4 RETURNING *',
      [title, content, tags, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/memos/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM memos WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==================== 할 일 API ====================
app.get('/api/todos', async (req, res) => {
  try {
    const { completed, priority, tag } = req.query;
    let sql = 'SELECT * FROM todos WHERE 1=1';
    const params: any[] = [];
    let idx = 1;

    if (completed !== undefined) {
      sql += ` AND completed = $${idx}`;
      params.push(completed === 'true');
      idx++;
    }
    if (priority) {
      sql += ` AND priority = $${idx}`;
      params.push(priority);
      idx++;
    }
    if (tag) {
      sql += ` AND $${idx} = ANY(tags)`;
      params.push(tag);
    }
    sql += ` ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, due_date ASC NULLS LAST`;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/todos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const { title, description = '', priority = 'medium', due_date, tags = [] } = req.body;
    const result = await pool.query(
      'INSERT INTO todos (title, description, priority, due_date, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, priority, due_date || null, tags]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { title, description, completed, priority, due_date, tags } = req.body;
    const result = await pool.query(
      `UPDATE todos SET 
        title = COALESCE($1, title), 
        description = COALESCE($2, description), 
        completed = COALESCE($3, completed), 
        priority = COALESCE($4, priority), 
        due_date = COALESCE($5, due_date), 
        tags = COALESCE($6, tags) 
      WHERE id = $7 RETURNING *`,
      [title, description, completed, priority, due_date, tags, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==================== 일정 API ====================
app.get('/api/schedules', async (req, res) => {
  try {
    const { date, from_date, to_date, tag } = req.query;
    let sql = 'SELECT * FROM schedules WHERE 1=1';
    const params: any[] = [];
    let idx = 1;

    if (date) {
      sql += ` AND DATE(start_time) = $${idx}`;
      params.push(date);
      idx++;
    }
    if (from_date) {
      sql += ` AND DATE(start_time) >= $${idx}`;
      params.push(from_date);
      idx++;
    }
    if (to_date) {
      sql += ` AND DATE(start_time) <= $${idx}`;
      params.push(to_date);
      idx++;
    }
    if (tag) {
      sql += ` AND $${idx} = ANY(tags)`;
      params.push(tag);
    }
    sql += ' ORDER BY start_time ASC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/schedules/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedules WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/schedules', async (req, res) => {
  try {
    const { title, description = '', start_time, end_time, location = '', tags = [] } = req.body;
    const result = await pool.query(
      'INSERT INTO schedules (title, description, start_time, end_time, location, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, start_time, end_time || null, location, tags]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/schedules/:id', async (req, res) => {
  try {
    const { title, description, start_time, end_time, location, tags } = req.body;
    const result = await pool.query(
      `UPDATE schedules SET 
        title = COALESCE($1, title), 
        description = COALESCE($2, description), 
        start_time = COALESCE($3, start_time), 
        end_time = COALESCE($4, end_time), 
        location = COALESCE($5, location), 
        tags = COALESCE($6, tags) 
      WHERE id = $7 RETURNING *`,
      [title, description, start_time, end_time, location, tags, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==================== 북마크 API ====================
app.get('/api/bookmarks', async (req, res) => {
  try {
    const { query, tag } = req.query;
    let sql = 'SELECT * FROM bookmarks WHERE 1=1';
    const params: any[] = [];
    let idx = 1;

    if (query) {
      sql += ` AND (title ILIKE $${idx} OR description ILIKE $${idx + 1} OR url ILIKE $${idx + 2})`;
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
      idx += 3;
    }
    if (tag) {
      sql += ` AND $${idx} = ANY(tags)`;
      params.push(tag);
    }
    sql += ' ORDER BY created_at DESC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/bookmarks/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookmarks WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/bookmarks', async (req, res) => {
  try {
    const { url, title, description = '', tags = [] } = req.body;
    const result = await pool.query(
      'INSERT INTO bookmarks (url, title, description, tags) VALUES ($1, $2, $3, $4) RETURNING *',
      [url, title, description, tags]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/bookmarks/:id', async (req, res) => {
  try {
    const { url, title, description, tags } = req.body;
    const result = await pool.query(
      `UPDATE bookmarks SET 
        url = COALESCE($1, url), 
        title = COALESCE($2, title), 
        description = COALESCE($3, description), 
        tags = COALESCE($4, tags) 
      WHERE id = $5 RETURNING *`,
      [url, title, description, tags, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/bookmarks/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM bookmarks WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// ==================== 통계/요약 API ====================
app.get('/api/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [memoCount, todoStats, todaySchedules, bookmarkCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM memos'),
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE completed = false) as incomplete,
          COUNT(*) FILTER (WHERE completed = true) as completed,
          COUNT(*) FILTER (WHERE due_date = CURRENT_DATE AND completed = false) as due_today
        FROM todos
      `),
      pool.query('SELECT * FROM schedules WHERE DATE(start_time) = $1 ORDER BY start_time', [today]),
      pool.query('SELECT COUNT(*) as count FROM bookmarks'),
    ]);

    res.json({
      date: today,
      memos: { total: parseInt(memoCount.rows[0].count) },
      todos: {
        incomplete: parseInt(todoStats.rows[0].incomplete),
        completed: parseInt(todoStats.rows[0].completed),
        dueToday: parseInt(todoStats.rows[0].due_today),
      },
      schedules: { today: todaySchedules.rows },
      bookmarks: { total: parseInt(bookmarkCount.rows[0].count) },
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});

