import { readFile } from 'node:fs/promises';
import pool from '../src/config/db.js';

try {
  const sql = await readFile(new URL('../../database/003_auth_sessions.sql', import.meta.url), 'utf8');
  await pool.query(sql);
  console.log('Đã chuẩn bị bảng phiên đăng nhập. Dữ liệu hiện có được giữ nguyên.');
} catch (error) {
  console.error('Không cập nhật được bảng phiên đăng nhập:', error.code || error.name);
  process.exitCode = 1;
} finally {
  await pool.end();
}
