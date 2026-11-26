import { randomUUID } from 'node:crypto';
import pool from '../config/db.js';
import { cleanExpiredHolds } from '../services/seatHoldService.js';

function reject(statusCode, message) { throw Object.assign(new Error(message), { statusCode }); }

// Preparing an invoice does not sell a seat or extend its hold.
export async function confirmBooking(req, res) {
  const { holdId, items = [], expectedTotal } = req.body || {};
  if (!Number.isSafeInteger(Number(holdId)) || Number(holdId) < 1 || !Array.isArray(items) || items.length > 50
    || items.some(i => !Number.isSafeInteger(i.productId) || i.productId < 1 || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 10)
    || new Set(items.map(i => i.productId)).size !== items.length || !Number.isFinite(expectedTotal) || expectedTotal < 0) reject(400, 'Thông tin đơn hàng chưa hợp lệ.');
  await cleanExpiredHolds();
  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    const [holds] = await db.query('SELECT * FROM seat_holds WHERE id = ? AND user_id = ? FOR UPDATE', [holdId, res.locals.account.id]);
    const hold = holds[0];
    if (!hold) reject(404, 'Không tìm thấy phiên giữ ghế.');
    const [existing] = await db.query('SELECT * FROM bookings WHERE hold_id = ? FOR UPDATE', [holdId]);
    if (existing[0]?.status === 'paid') {
      await db.commit();
      return res.json({ success: true, data: { bookingId: existing[0].id, bookingCode: existing[0].booking_code, status: 'paid' } });
    }
    if (hold.status !== 'active' || new Date(hold.expires_at).getTime() <= Date.now()) reject(409, 'Đã hết thời gian giữ ghế. Hãy chọn lại ghế.');
    const [shows] = await db.query("SELECT id FROM showtimes WHERE id = ? AND status = 'scheduled' AND starts_at > NOW() FOR SHARE", [hold.showtime_id]);
    if (!shows.length) reject(409, 'Suất chiếu đã bắt đầu hoặc đã bị hủy.');
    const [seats] = await db.query(`SELECT ss.*, s.row_label, s.seat_number FROM showtime_seats ss JOIN seats s ON s.id = ss.seat_id
      WHERE ss.hold_id = ? AND ss.showtime_id = ? AND ss.state = 'held' AND ss.held_until > NOW() ORDER BY ss.seat_id FOR UPDATE`, [holdId, hold.showtime_id]);
    if (!seats.length) reject(409, 'Phiên không còn giữ ghế.');
    const lines = [];
    for (const item of [...items].sort((a, b) => a.productId - b.productId)) {
      const [products] = await db.query('SELECT * FROM products WHERE id = ? AND is_active = TRUE FOR SHARE', [item.productId]);
      if (!products.length) reject(409, 'Một món bắp nước đã ngừng bán. Hãy chọn lại combo.');
      lines.push({ ...products[0], quantity: item.quantity });
    }
    const ticketTotal = seats.reduce((sum, seat) => sum + Number(seat.price), 0);
    const productTotal = lines.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const total = ticketTotal + productTotal;
    if (total !== expectedTotal) reject(409, 'Giá đã thay đổi. Tải lại trang để kiểm tra tổng tiền.');
    let id = existing[0]?.id;
    const code = existing[0]?.booking_code || `NC${randomUUID().replaceAll('-', '').slice(0, 28).toUpperCase()}`;
    if (id) {
      await db.query("UPDATE bookings SET status = 'pending', ticket_subtotal = ?, product_subtotal = ?, total_amount = ? WHERE id = ?", [ticketTotal, productTotal, total, id]);
      await db.query('DELETE FROM booking_items WHERE booking_id = ?', [id]);
      await db.query('DELETE FROM booking_seats WHERE booking_id = ?', [id]);
    } else {
      const [insert] = await db.query('INSERT INTO bookings (booking_code,user_id,showtime_id,hold_id,ticket_subtotal,product_subtotal,total_amount) VALUES (?,?,?,?,?,?,?)', [code, hold.user_id, hold.showtime_id, hold.id, ticketTotal, productTotal, total]);
      id = insert.insertId;
    }
    for (const seat of seats) await db.query('INSERT INTO booking_seats (booking_id,showtime_id,seat_id,seat_label,unit_price) VALUES (?,?,?,?,?)', [id, hold.showtime_id, seat.seat_id, `${seat.row_label}${seat.seat_number}`, seat.price]);
    for (const item of lines) await db.query('INSERT INTO booking_items (booking_id,product_id,product_name,quantity,unit_price) VALUES (?,?,?,?,?)', [id, item.id, item.name, item.quantity, item.price]);
    await db.commit();
    res.json({ success: true, data: { bookingId: id, bookingCode: code, totalAmount: total, status: 'pending' } });
  } catch (error) { await db.rollback(); throw error; }
  finally { db.release(); }
}

export async function processPayment(req, res) {
  const { method = 'mock', outcome = 'success', requestId, expectedTotal } = req.body || {};
  if (!['momo','vnpay','card','mock'].includes(method) || !['success','failure'].includes(outcome) || !/^[a-f0-9-]{36}$/i.test(requestId || '') || !Number.isFinite(expectedTotal)) reject(400, 'Yêu cầu thanh toán chưa hợp lệ.');
  const [lookup] = await pool.query('SELECT hold_id FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, res.locals.account.id]);
  if (!lookup[0]) reject(404, 'Không tìm thấy đơn hàng.');
  await cleanExpiredHolds();
  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    // Lock hold before booking and inventory, matching cancellation and expiry.
    const [holds] = await db.query('SELECT * FROM seat_holds WHERE id = ? FOR UPDATE', [lookup[0].hold_id]);
    const [orders] = await db.query('SELECT * FROM bookings WHERE id = ? AND user_id = ? FOR UPDATE', [req.params.id, res.locals.account.id]);
    const order = orders[0], hold = holds[0];
    const transactionCode = `MOCK-${requestId}`;
    const [prior] = await db.query('SELECT * FROM payments WHERE transaction_code = ?', [transactionCode]);
    if (prior.length) {
      const payment = prior[0];
      if (String(payment.booking_id) !== String(order.id) || payment.method !== method || (payment.status === 'succeeded') !== (outcome === 'success') || Number(payment.amount) !== expectedTotal) reject(409, 'Mã thanh toán đã dùng cho yêu cầu khác.');
      await db.commit();
      return res.json({ success: true, data: { bookingId: order.id, bookingCode: order.booking_code, status: payment.status === 'succeeded' ? 'paid' : 'payment_failed' } });
    }
    if (order.status === 'paid') {
      await db.commit();
      return res.json({ success: true, data: { bookingId: order.id, bookingCode: order.booking_code, status: 'paid' } });
    }
    if (!hold || hold.status !== 'active' || new Date(hold.expires_at).getTime() <= Date.now() || !['pending','payment_failed'].includes(order.status)) reject(409, 'Phiên đặt vé đã hết hạn hoặc bị hủy.');
    if (Number(order.total_amount) !== expectedTotal) reject(409, 'Tổng tiền đơn đã thay đổi. Hãy kiểm tra lại.');
    const [shows] = await db.query("SELECT id FROM showtimes WHERE id = ? AND status = 'scheduled' AND starts_at > NOW() FOR SHARE", [order.showtime_id]);
    if (!shows.length) reject(409, 'Suất chiếu không còn mở đặt vé.');
    const [seats] = await db.query(`SELECT ss.seat_id FROM showtime_seats ss JOIN booking_seats bs ON bs.showtime_id = ss.showtime_id AND bs.seat_id = ss.seat_id
      WHERE bs.booking_id = ? AND ss.state = 'held' AND ss.hold_id = ? AND ss.held_until > NOW() ORDER BY ss.seat_id FOR UPDATE`, [order.id, hold.id]);
    const [counts] = await db.query('SELECT COUNT(*) AS total FROM booking_seats WHERE booking_id = ?', [order.id]);
    if (!seats.length || seats.length !== Number(counts[0].total)) reject(409, 'Ghế không còn được giữ đầy đủ.');
    const paid = outcome === 'success';
    await db.query('INSERT INTO payments (booking_id,transaction_code,method,is_mock,amount,status,completed_at) VALUES (?,?,?,TRUE,?,?,NOW())', [order.id, transactionCode, method, order.total_amount, paid ? 'succeeded' : 'failed']);
    if (paid) {
      await db.query("UPDATE bookings SET status = 'paid', paid_at = NOW(), qr_token = ? WHERE id = ?", [`NOVA-${randomUUID()}`, order.id]);
      await db.query("UPDATE showtime_seats SET state = 'booked', booking_id = ?, hold_id = NULL, held_until = NULL WHERE hold_id = ? AND state = 'held'", [order.id, hold.id]);
      await db.query("UPDATE seat_holds SET status = 'converted' WHERE id = ?", [hold.id]);
    } else await db.query("UPDATE bookings SET status = 'payment_failed' WHERE id = ?", [order.id]);
    await db.commit();
    res.json({ success: true, data: { bookingId: order.id, bookingCode: order.booking_code, status: paid ? 'paid' : 'payment_failed' } });
  } catch (error) { await db.rollback(); throw error; }
  finally { db.release(); }
}

export async function receiptFor(row) {
  const [seats] = await pool.query('SELECT seat_label,unit_price FROM booking_seats WHERE booking_id = ? ORDER BY seat_label', [row.id]);
  const [items] = await pool.query('SELECT product_id,product_name,quantity,unit_price FROM booking_items WHERE booking_id = ?', [row.id]);
  const [payments] = await pool.query('SELECT method,status,transaction_code,amount,created_at FROM payments WHERE booking_id = ? ORDER BY id DESC', [row.id]);
  return { version: 2, source: 'database', id: row.id, status: row.status, demoBooking: false, isMock: true,
    orderCode: row.booking_code, ticketCode: row.qr_token, confirmedAt: row.paid_at || row.created_at,
    createdAt: row.created_at, paidAt: row.paid_at, method: payments.find(p => p.status === 'succeeded')?.method || payments[0]?.method || 'mock', payments,
    seatLines: seats.map(s => ({ label: s.seat_label, unitPrice: Number(s.unit_price) })),
    booking: { holdId: row.hold_id, showtimeId: row.showtime_id, movieTitle: row.movie_title, poster: row.poster_url, ageRating: row.age_rating,
      cinemaName: row.cinema_name, roomName: row.room_name, startsAt: row.starts_at, format: row.format,
      expiresAt: row.expires_at, seats: seats.map(s => s.seat_label), ticketSubtotal: Number(row.ticket_subtotal) },
    contact: { name: row.full_name, email: row.email, phone: row.phone || '' },
    items: items.map(i => ({productId: i.product_id, name: i.product_name, quantity: i.quantity, unitPrice: Number(i.unit_price), subtotal: Number(i.unit_price) * i.quantity})),
    productSubtotal: Number(row.product_subtotal), total: Number(row.total_amount) };
}
export const receiptSql = `SELECT b.*, s.starts_at, s.format, m.title AS movie_title, m.poster_url, m.age_rating,
  c.name AS cinema_name, r.name AS room_name, h.expires_at, u.full_name,u.email,u.phone
  FROM bookings b JOIN showtimes s ON b.showtime_id=s.id JOIN movies m ON m.id=s.movie_id
  JOIN rooms r ON r.id=s.room_id JOIN cinemas c ON c.id=r.cinema_id LEFT JOIN seat_holds h ON h.id=b.hold_id JOIN users u ON u.id=b.user_id`;
export async function getBooking(req, res) {
  await cleanExpiredHolds();
  const [rows] = await pool.query(`${receiptSql} WHERE b.booking_code = ? AND b.user_id = ?`, [req.params.id, res.locals.account.id]);
  if (!rows[0]) reject(404, 'Không tìm thấy đơn hàng của bạn.');
  res.set('Cache-Control', 'no-store').json({success: true, data: await receiptFor(rows[0])});
}
export async function listBookings(req, res) {
  await cleanExpiredHolds();
  if (req.query.status && !['all', 'paid'].includes(req.query.status)) reject(400, 'Bộ lọc trạng thái không hợp lệ.');
  const [rows] = await pool.query(`${receiptSql} WHERE b.user_id = ? ${req.query.status === 'all' ? '' : "AND b.status = 'paid'"} ORDER BY b.created_at DESC, b.id DESC`, [res.locals.account.id]);
  res.set('Cache-Control', 'no-store').json({success: true, data: await Promise.all(rows.map(receiptFor))});
}
