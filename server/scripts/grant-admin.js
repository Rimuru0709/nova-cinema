import pool from '../src/config/db.js';

// Chỉ chạy tại terminal của người quản lý database, không mở API cấp quyền công khai.
const email = (process.argv[2] || '').trim().toLowerCase();
try {
  if (process.argv.length !== 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Cách dùng: npm.cmd run admin:grant -- email-da-dang-ky');
  }
  const [rows] = await pool.execute('SELECT id, status FROM users WHERE email = ?', [email]);
  if (rows.length !== 1) throw new Error('Email chưa đăng ký. Hãy tạo tài khoản trên website trước.');
  if (rows[0].status !== 'active') throw new Error('Tài khoản đang bị khóa. Chưa cấp quyền.');
  const [result] = await pool.execute("UPDATE users SET role = 'admin' WHERE id = ? AND status = 'active'", [rows[0].id]);
  if (!result.affectedRows) throw new Error('Tài khoản đã thay đổi trạng thái. Hãy kiểm tra lại.');
  console.log(`Đã cấp quyền admin cho ${email}. Đăng nhập lại trên website để vào trang quản trị.`);
} catch (error) {
  console.error(error.code ? `Không cấp quyền được: ${error.code}` : error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
