import express from 'express';
import pool from '../config/db.js';
import { requireSession, requireAdmin } from './auth.js';
import { receiptFor, receiptSql } from '../controllers/checkoutController.js';
import { cleanExpiredHolds } from '../services/seatHoldService.js';

const router = express.Router();
router.use(requireSession, requireAdmin, (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
const fail = (message, statusCode = 400) => { throw Object.assign(new Error(message), { statusCode }); };
const statuses = ['pending', 'paid', 'payment_failed', 'cancelled', 'expired'];
const categories = ['popcorn', 'drink', 'combo'];
const positiveInt = (value, fallback) => {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) fail('Số định danh hoặc số trang không hợp lệ.');
  return Number(value);
};

function filters(query, dateColumn) {
  const clauses = [], params = [];
  for (const key of ['from', 'to']) {
    if (!query[key]) continue;
    const value = query[key];
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) fail('Ngày lọc không hợp lệ.');
    clauses.push(`${dateColumn} ${key === 'from' ? '>=' : '<'} ${key === 'from' ? '?' : 'DATE_ADD(?, INTERVAL 1 DAY)'}`);
    params.push(value);
  }
  if (query.from && query.to && query.from > query.to) fail('Ngày bắt đầu phải trước ngày kết thúc.');
  if (query.cinemaId) { clauses.push('r.cinema_id = ?'); params.push(positiveInt(query.cinemaId)); }
  return { clauses, params };
}
const where = clauses => clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
const joins = 'FROM bookings b JOIN showtimes s ON s.id=b.showtime_id JOIN rooms r ON r.id=s.room_id';

router.get('/cinemas', async (_req, res) => {
  const [data] = await pool.query('SELECT id,name FROM cinemas ORDER BY name');
  res.json({ success: true, data });
});

router.get('/overview', async (req, res) => {
  await cleanExpiredHolds();
  const { clauses, params } = filters(req.query, 'b.paid_at');
  clauses.push("b.status = 'paid'");
  const condition = where(clauses);
  const [[totals], [days], [movies], [products]] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS orders, COALESCE(SUM(b.ticket_subtotal),0) AS tickets,
      COALESCE(SUM(b.product_subtotal),0) AS products, COALESCE(SUM(b.total_amount),0) AS revenue,
      COALESCE(SUM((SELECT COUNT(*) FROM booking_seats bs WHERE bs.booking_id=b.id)),0) AS seats
      ${joins} ${condition}`, params),
    pool.query(`SELECT DATE_FORMAT(b.paid_at,'%Y-%m-%d') AS day,SUM(b.total_amount) AS revenue,COUNT(*) AS orders ${joins} ${condition} GROUP BY day ORDER BY day`, params),
    pool.query(`SELECT m.id,m.title,SUM(b.ticket_subtotal) AS revenue,COUNT(*) AS orders ${joins} JOIN movies m ON m.id=s.movie_id ${condition} GROUP BY m.id,m.title ORDER BY revenue DESC LIMIT 8`, params),
    pool.query(`SELECT i.product_id AS id,MAX(i.product_name) AS name,SUM(i.quantity) AS quantity,SUM(i.quantity*i.unit_price) AS revenue ${joins} JOIN booking_items i ON i.booking_id=b.id ${condition} GROUP BY i.product_id ORDER BY revenue DESC LIMIT 8`, params),
  ]);
  res.json({ success: true, data: { totals: totals[0], days, movies, products } });
});

router.get('/orders', async (req, res) => {
  await cleanExpiredHolds();
  const { clauses, params } = filters(req.query, 'b.created_at');
  if (req.query.status && req.query.status !== 'all') {
    if (!statuses.includes(req.query.status)) fail('Trạng thái không hợp lệ.');
    clauses.push('b.status = ?'); params.push(req.query.status);
  }
  if (req.query.q) {
    if (typeof req.query.q !== 'string' || req.query.q.length > 150) fail('Từ khóa quá dài.');
    clauses.push('(LOCATE(?, b.booking_code)>0 OR LOCATE(?, u.full_name)>0 OR LOCATE(?, u.email)>0)');
    params.push(req.query.q.trim(), req.query.q.trim(), req.query.q.trim());
  }
  const page = positiveInt(req.query.page, 1), pageSize = Math.min(positiveInt(req.query.pageSize, 15), 100);
  const [[counts], [rows]] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total ${joins} JOIN users u ON u.id=b.user_id ${where(clauses)}`, params),
    pool.query(`${receiptSql} ${where(clauses)} ORDER BY b.created_at DESC,b.id DESC LIMIT ? OFFSET ?`, [...params, pageSize, (page - 1) * pageSize]),
  ]);
  const data = await Promise.all(rows.map(receiptFor));
  res.json({ success: true, data: { orders: data, total: Number(counts[0].total), page, pageSize } });
});
router.get('/orders/:code', async (req, res) => {
  await cleanExpiredHolds();
  const [rows] = await pool.query(`${receiptSql} WHERE b.booking_code = ?`, [req.params.code]);
  if (!rows[0]) fail('Không tìm thấy đơn hàng.', 404);
  res.json({ success: true, data: await receiptFor(rows[0]) });
});

function productInput(body) {
  const { code, name, category, description = '', price, image = '', isActive } = body || {};
  if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{1,40}$/.test(code.trim())) fail('Mã sản phẩm gồm tối đa 40 chữ, số, gạch ngang hoặc gạch dưới.');
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 150) fail('Tên sản phẩm cần từ 1 đến 150 ký tự.');
  if (!categories.includes(category)) fail('Loại sản phẩm không hợp lệ.');
  if (typeof description !== 'string' || description.length > 3000) fail('Mô tả tối đa 3000 ký tự.');
  if (!Number.isSafeInteger(price) || price < 0 || price > 100000000) fail('Giá phải là số nguyên từ 0 đến 100.000.000 đồng.');
  if (typeof isActive !== 'boolean') fail('Trạng thái bán không hợp lệ.');
  if (typeof image !== 'string' || image.length > 2000 || (image && !/^https?:\/\//i.test(image) && !/^\/(?!\/)/.test(image))) fail('Ảnh cần là đường dẫn /... hoặc URL http(s).');
  return [code.trim(), name.trim(), category, description.trim(), price, image.trim() || null, isActive];
}
const mapProduct = row => ({ id: row.id, code: row.code, name: row.name, category: row.category, description: row.description, price: Number(row.price), image: row.image_url || '', isActive: Boolean(row.is_active) });
router.get('/products', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
  res.json({ success: true, data: rows.map(mapProduct) });
});
router.post('/products', async (req, res) => {
  const values = productInput(req.body);
  const [result] = await pool.query('INSERT INTO products (code,name,category,description,price,image_url,is_active) VALUES (?,?,?,?,?,?,?)', values);
  res.status(201).json({ success: true, data: { id: result.insertId } });
});
router.put('/products/:id', async (req, res) => {
  const values = productInput(req.body), id = positiveInt(req.params.id);
  const [result] = await pool.query('UPDATE products SET code=?,name=?,category=?,description=?,price=?,image_url=?,is_active=? WHERE id=?', [...values, id]);
  if (!result.affectedRows) fail('Không tìm thấy sản phẩm.', 404);
  res.json({ success: true, data: { id } });
});
router.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Mã sản phẩm đã tồn tại.' });
  if (!error.statusCode) console.error('TV4 admin API:', error.code || error.name);
  res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Chưa xử lý được dữ liệu quản trị. Vui lòng thử lại.' });
});
export default router;
