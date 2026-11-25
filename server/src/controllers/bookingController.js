import crypto from 'crypto';
import pool from '../config/db.js';
import { cleanExpiredHolds, ensureDefaultUser } from '../services/seatHoldService.js';

/**
 * Phối hợp với Thành viên 4: Xác nhận đặt vé từ phiên giữ ghế.
 * Chuyển trạng thái giữ ghế thành đơn đặt vé (bookings), chuyển showtime_seats sang 'booked'.
 */
export async function confirmBooking(req, res) {
    const { holdId, userId, items = [] } = req.body;

    if (!holdId) {
        return res.status(400).json({ success: false, message: 'Thiếu holdId để tạo đơn đặt vé.' });
    }

    // Dọn dẹp hết hạn trước
    await cleanExpiredHolds();

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Kiểm tra phiên giữ ghế còn active và chưa hết hạn
        const [holds] = await connection.query(
            `SELECT id, user_id, showtime_id, status, expires_at 
             FROM seat_holds 
             WHERE id = ? FOR UPDATE`,
            [holdId]
        );

        if (holds.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiên giữ ghế.' });
        }

        const hold = holds[0];
        if (hold.status !== 'active' || new Date(hold.expires_at) <= new Date()) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Phiên giữ ghế đã hết hạn hoặc không còn hiệu lực. Vui lòng chọn lại ghế.'
            });
        }

        // 2. Lấy các ghế đang giữ bởi holdId
        const [heldSeats] = await connection.query(
            `SELECT ss.seat_id, ss.price, s.row_label, s.seat_number, s.seat_type
             FROM showtime_seats ss
             JOIN seats s ON ss.seat_id = s.id
             WHERE ss.showtime_id = ? AND ss.hold_id = ?
             FOR UPDATE`,
            [hold.showtime_id, hold.id]
        );

        if (heldSeats.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Không tìm thấy ghế nào đang được giữ trong phiên này.' });
        }

        // Tính tiền vé
        let ticketSubtotal = 0;
        heldSeats.forEach(s => {
            ticketSubtotal += Number(s.price);
        });

        // Tính tiền bắp nước nếu có
        let productSubtotal = 0;
        const validItems = [];
        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                if (item.productId && item.quantity > 0) {
                    const [prodRows] = await connection.query(
                        `SELECT id, name, price FROM products WHERE id = ? AND is_active = TRUE`,
                        [item.productId]
                    );
                    if (prodRows.length > 0) {
                        const prod = prodRows[0];
                        const lineTotal = Number(prod.price) * Number(item.quantity);
                        productSubtotal += lineTotal;
                        validItems.push({
                            productId: prod.id,
                            name: prod.name,
                            unitPrice: Number(prod.price),
                            quantity: Number(item.quantity)
                        });
                    }
                }
            }
        }

        const totalAmount = ticketSubtotal + productSubtotal;
        const bookingCode = `NC${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;
        const targetUserId = userId || hold.user_id || (await ensureDefaultUser(connection));

        // 3. Tạo bản ghi trong bookings
        const [bookingInsert] = await connection.query(
            `INSERT INTO bookings (
                booking_code, user_id, showtime_id, hold_id, status,
                ticket_subtotal, product_subtotal, total_amount, created_at
             ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, NOW())`,
            [bookingCode, targetUserId, hold.showtime_id, hold.id, ticketSubtotal, productSubtotal, totalAmount]
        );
        const bookingId = bookingInsert.insertId;

        // 4. Lưu danh sách ghế vào booking_seats
        for (const seat of heldSeats) {
            const seatLabel = `${seat.row_label}${seat.seat_number}`;
            await connection.query(
                `INSERT INTO booking_seats (booking_id, showtime_id, seat_id, seat_label, unit_price)
                 VALUES (?, ?, ?, ?, ?)`,
                [bookingId, hold.showtime_id, seat.seat_id, seatLabel, seat.price]
            );
        }

        // 5. Lưu danh sách sản phẩm (nếu có) vào booking_items
        for (const item of validItems) {
            await connection.query(
                `INSERT INTO booking_items (booking_id, product_id, product_name, quantity, unit_price)
                 VALUES (?, ?, ?, ?, ?)`,
                [bookingId, item.productId, item.name, item.quantity, item.unitPrice]
            );
        }

        // 6. Cập nhật showtime_seats: chuyển sang 'booked', gán booking_id, xóa hold_id & held_until
        await connection.query(
            `UPDATE showtime_seats
             SET state = 'booked', booking_id = ?, hold_id = NULL, held_until = NULL
             WHERE showtime_id = ? AND hold_id = ?`,
            [bookingId, hold.showtime_id, hold.id]
        );

        // 7. Chuyển trạng thái seat_holds thành 'converted'
        await connection.query(
            `UPDATE seat_holds
             SET status = 'converted'
             WHERE id = ?`,
            [hold.id]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Tạo đơn đặt vé thành công. Vui lòng thanh toán để nhận vé xem phim.',
            data: {
                bookingId,
                bookingCode,
                showtimeId: hold.showtime_id,
                ticketSubtotal,
                productSubtotal,
                totalAmount,
                status: 'pending',
                seats: heldSeats.map(s => `${s.row_label}${s.seat_number}`)
            }
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Lỗi khi xác nhận đặt vé:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Phối hợp với Thành viên 4: Xử lý thanh toán và phát hành mã QR vé.
 */
export async function processPayment(req, res) {
    const { id } = req.params; // bookingId
    const { method = 'mock' } = req.body;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [bookings] = await connection.query(
            `SELECT id, booking_code, total_amount, status, user_id FROM bookings WHERE id = ? FOR UPDATE`,
            [id]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt vé.' });
        }

        const booking = bookings[0];
        if (booking.status === 'paid') {
            await connection.rollback();
            return res.json({ success: true, message: 'Đơn này đã được thanh toán trước đó.' });
        }

        if (booking.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: `Không thể thanh toán đơn có trạng thái ${booking.status}.` });
        }

        // Tạo mã giao dịch và mã token QR
        const transactionCode = `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
        const qrToken = `NOVA-TICKET-${booking.booking_code}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

        // 1. Ghi nhận giao dịch thanh toán
        await connection.query(
            `INSERT INTO payments (booking_id, transaction_code, method, is_mock, amount, status, created_at, completed_at)
             VALUES (?, ?, ?, TRUE, ?, 'succeeded', NOW(), NOW())`,
            [booking.id, transactionCode, method, booking.total_amount]
        );

        // 2. Cập nhật booking thành 'paid' kèm mã qr_token và paid_at
        await connection.query(
            `UPDATE bookings
             SET status = 'paid', paid_at = NOW(), qr_token = ?
             WHERE id = ?`,
            [qrToken, booking.id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Thanh toán thành công! Vé đã được phát hành.',
            data: {
                bookingId: booking.id,
                bookingCode: booking.booking_code,
                totalAmount: Number(booking.total_amount),
                status: 'paid',
                transactionCode,
                qrToken,
                method
            }
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Lỗi khi thanh toán:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Lấy chi tiết đơn đặt vé và mã QR cho khách hàng.
 */
export async function getBooking(req, res) {
    try {
        const { id } = req.params;

        const [bookings] = await pool.query(
            `SELECT 
                b.id,
                b.booking_code,
                b.user_id,
                b.showtime_id,
                b.status,
                b.ticket_subtotal,
                b.product_subtotal,
                b.total_amount,
                b.qr_token,
                b.created_at,
                b.paid_at,
                s.starts_at,
                s.ends_at,
                s.format,
                m.title AS movie_title,
                m.poster_url,
                c.name AS cinema_name,
                c.address AS cinema_address,
                r.name AS room_name
            FROM bookings b
            JOIN showtimes s ON b.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas c ON r.cinema_id = c.id
            WHERE b.id = ? OR b.booking_code = ?`,
            [id, id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt vé.' });
        }

        const b = bookings[0];

        // Lấy danh sách ghế
        const [seats] = await pool.query(
            `SELECT seat_label, unit_price FROM booking_seats WHERE booking_id = ?`,
            [b.id]
        );

        // Lấy danh sách bắp nước
        const [items] = await pool.query(
            `SELECT product_name, quantity, unit_price FROM booking_items WHERE booking_id = ?`,
            [b.id]
        );

        res.json({
            success: true,
            data: {
                id: b.id,
                bookingCode: b.booking_code,
                movieTitle: b.movie_title,
                moviePoster: b.poster_url,
                cinemaName: b.cinema_name,
                cinemaAddress: b.cinema_address,
                roomName: b.room_name,
                format: b.format,
                startsAt: b.starts_at,
                endsAt: b.ends_at,
                ticketSubtotal: Number(b.ticket_subtotal),
                productSubtotal: Number(b.product_subtotal),
                totalAmount: Number(b.total_amount),
                status: b.status,
                qrToken: b.qr_token,
                paidAt: b.paid_at,
                createdAt: b.created_at,
                seats: seats.map(s => ({ label: s.seat_label, price: Number(s.unit_price) })),
                items: items.map(i => ({ name: i.product_name, quantity: i.quantity, price: Number(i.unit_price) }))
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin đơn đặt vé:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}
