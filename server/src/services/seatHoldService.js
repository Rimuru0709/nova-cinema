import pool from '../config/db.js';

// Đảm bảo có ít nhất 1 tài khoản khách hàng mặc định để thỏa mãn khóa ngoại seat_holds.user_id
export async function ensureDefaultUser(connection = null) {
    const executor = connection || pool;
    const [rows] = await executor.query('SELECT id FROM users LIMIT 1');
    if (rows.length > 0) {
        return rows[0].id;
    }
    const [result] = await executor.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, status)
         VALUES ('Khách Hàng NOVA', 'guest@novacinema.vn', '0901234567', 'no-password', 'user', 'active')`
    );
    return result.insertId;
}

/**
 * Tự động giải phóng các ghế đã hết hạn 3 phút (expires_at <= NOW()).
 * Cần update showtime_seats trước (set state = 'available', hold_id = NULL, held_until = NULL)
 * Sau đó update seat_holds (status = 'expired').
 */
export async function cleanExpiredHolds() {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Giải phóng các ghế đang ở trạng thái 'held' mà thời hạn held_until đã qua
        const [releasedSeats] = await connection.query(
            `UPDATE showtime_seats
             SET state = 'available', hold_id = NULL, held_until = NULL
             WHERE state = 'held' AND (held_until IS NULL OR held_until <= NOW())`
        );

        // 2. Chuyển trạng thái các lượt giữ ghế quá hạn thành 'expired'
        const [expiredHolds] = await connection.query(
            `UPDATE seat_holds
             SET status = 'expired'
             WHERE status = 'active' AND expires_at <= NOW()`
        );

        await connection.commit();
        return {
            releasedSeatsCount: releasedSeats.affectedRows || 0,
            expiredHoldsCount: expiredHolds.affectedRows || 0
        };
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Lỗi khi dọn dẹp ghế hết hạn:', error);
        return { error: error.message };
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Lấy danh sách sơ đồ ghế của một suất chiếu kèm trạng thái hiện tại.
 */
export async function getShowtimeSeats(showtimeId, currentUserId = null) {
    // Luôn dọn dẹp các ghế hết hạn trước khi đọc sơ đồ
    await cleanExpiredHolds();

    // 1. Kiểm tra suất chiếu còn tồn tại và hợp lệ
    const [showtimes] = await pool.query(
        `SELECT 
            s.id,
            s.movie_id,
            s.room_id,
            s.starts_at,
            s.ends_at,
            s.base_price,
            s.format,
            s.status,
            m.title AS movie_title,
            m.poster_url AS movie_poster,
            m.duration_minutes,
            m.age_rating,
            c.id AS cinema_id,
            c.name AS cinema_name,
            c.address AS cinema_address,
            r.name AS room_name,
            r.capacity AS room_capacity
        FROM showtimes s
        JOIN movies m ON s.movie_id = m.id
        JOIN rooms r ON s.room_id = r.id
        JOIN cinemas c ON r.cinema_id = c.id
        WHERE s.id = ?`,
        [showtimeId]
    );

    if (showtimes.length === 0) {
        const error = new Error('Không tìm thấy suất chiếu.');
        error.statusCode = 404;
        throw error;
    }

    const showtime = showtimes[0];
    const isStarted = new Date(showtime.starts_at) <= new Date();
    const isCancelled = showtime.status === 'cancelled';
    const isValid = !isStarted && !isCancelled;

    // 2. Lấy danh sách ghế của suất chiếu
    const [seats] = await pool.query(
        `SELECT 
            ss.seat_id,
            ss.room_id,
            ss.price,
            ss.state,
            ss.hold_id,
            ss.held_until,
            ss.booking_id,
            s.row_label,
            s.seat_number,
            s.seat_type,
            sh.user_id AS hold_user_id,
            CASE 
                WHEN ss.state = 'held' AND ss.held_until > NOW() 
                THEN GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), ss.held_until))
                ELSE 0 
            END AS remaining_hold_seconds
        FROM showtime_seats ss
        JOIN seats s ON ss.seat_id = s.id
        LEFT JOIN seat_holds sh ON ss.hold_id = sh.id
        WHERE ss.showtime_id = ?
        ORDER BY s.row_label ASC, s.seat_number ASC`,
        [showtimeId]
    );

    // Chuẩn hóa danh sách ghế và nhóm theo hàng
    const formattedSeats = seats.map(seat => {
        const isHeld = seat.state === 'held' && seat.remaining_hold_seconds > 0;
        const isBooked = seat.state === 'booked';
        const isAvailable = !isHeld && !isBooked;

        return {
            seatId: seat.seat_id,
            rowLabel: seat.row_label,
            seatNumber: seat.seat_number,
            label: `${seat.row_label}${seat.seat_number}`,
            seatType: seat.seat_type, // 'standard' | 'vip' | 'couple'
            isVip: seat.seat_type === 'vip',
            price: Number(seat.price),
            state: isBooked ? 'booked' : isHeld ? 'held' : 'available',
            holdId: seat.hold_id,
            isHeldByCurrentUser: Boolean(currentUserId && Number(seat.hold_user_id) === Number(currentUserId)),
            remainingHoldSeconds: Number(seat.remaining_hold_seconds || 0)
        };
    });

    // Thống kê nhanh
    const stats = {
        total: formattedSeats.length,
        available: formattedSeats.filter(s => s.state === 'available').length,
        held: formattedSeats.filter(s => s.state === 'held').length,
        booked: formattedSeats.filter(s => s.state === 'booked').length,
        standardPrice: Number(showtime.base_price),
        vipPrice: Number(showtime.base_price) + 20000
    };

    return {
        showtime: {
            id: showtime.id,
            movieId: showtime.movie_id,
            movieTitle: showtime.movie_title,
            moviePoster: showtime.movie_poster,
            duration: showtime.duration_minutes,
            ageRating: showtime.age_rating,
            cinemaId: showtime.cinema_id,
            cinemaName: showtime.cinema_name,
            cinemaAddress: showtime.cinema_address,
            roomId: showtime.room_id,
            roomName: showtime.room_name,
            format: showtime.format,
            startsAt: showtime.starts_at,
            endsAt: showtime.ends_at,
            basePrice: Number(showtime.base_price),
            status: showtime.status,
            isValid,
            validityMessage: isStarted ? 'Suất chiếu đã bắt đầu.' : isCancelled ? 'Suất chiếu đã bị hủy.' : 'Suất chiếu hợp lệ.'
        },
        stats,
        seats: formattedSeats
    };
}

/**
 * Giữ ghế trong thời gian 3 phút (180 giây).
 * Áp dụng Transaction và FOR UPDATE để ngăn ngừa trường hợp 2 khách hàng cùng giữ 1 ghế.
 */
export async function holdSeats({ showtimeId, seatIds, userId = null }) {
    if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
        const error = new Error('Vui lòng chọn ít nhất một ghế.');
        error.statusCode = 400;
        throw error;
    }

    // Dọn dẹp các ghế đã hết hạn trước khi thực hiện giữ ghế mới
    await cleanExpiredHolds();

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Kiểm tra suất chiếu còn hợp lệ và khóa dòng showtime để đọc nhất quán
        const [showtimeRows] = await connection.query(
            `SELECT id, movie_id, room_id, starts_at, base_price, status 
             FROM showtimes 
             WHERE id = ? FOR SHARE`,
            [showtimeId]
        );

        if (showtimeRows.length === 0) {
            const error = new Error('Suất chiếu không tồn tại.');
            error.statusCode = 404;
            throw error;
        }

        const showtime = showtimeRows[0];
        if (showtime.status !== 'scheduled') {
            const error = new Error('Suất chiếu không ở trạng thái sẵn sàng (đã bị hủy hoặc hoãn).');
            error.statusCode = 400;
            throw error;
        }

        if (new Date(showtime.starts_at) <= new Date()) {
            const error = new Error('Suất chiếu đã bắt đầu. Không thể giữ ghế.');
            error.statusCode = 400;
            throw error;
        }

        // 2. KHÓA TẤT CẢ CÁC GHẾ YÊU CẦU BẰNG "FOR UPDATE"
        // Đây là điểm then chốt đảm bảo 2 khách hàng đồng thời không thể cùng giữ thành công một ghế!
        const [lockedSeats] = await connection.query(
            `SELECT 
                ss.seat_id,
                ss.state,
                ss.hold_id,
                ss.held_until,
                ss.price,
                s.row_label,
                s.seat_number,
                s.seat_type
             FROM showtime_seats ss
             JOIN seats s ON ss.seat_id = s.id
             WHERE ss.showtime_id = ? AND ss.seat_id IN (?)
             FOR UPDATE`,
            [showtimeId, seatIds]
        );

        if (lockedSeats.length !== seatIds.length) {
            const error = new Error('Một số ghế được chọn không tồn tại trong suất chiếu này.');
            error.statusCode = 400;
            throw error;
        }

        // 3. Kiểm tra tính khả dụng của từng ghế
        const now = new Date();
        for (const seat of lockedSeats) {
            const seatLabel = `${seat.row_label}${seat.seat_number}`;

            if (seat.state === 'booked') {
                const error = new Error(`Ghế ${seatLabel} đã được đặt mua.`);
                error.statusCode = 409;
                throw error;
            }

            if (seat.state === 'held' && seat.held_until && new Date(seat.held_until) > now) {
                const error = new Error(`Ghế ${seatLabel} đang được khách hàng khác giữ chỗ. Vui lòng chọn ghế khác.`);
                error.statusCode = 409;
                throw error;
            }
        }

        // 4. Lấy hoặc tạo user hợp lệ cho khóa ngoại
        const targetUserId = userId || (await ensureDefaultUser(connection));

        // 5. Tạo bản ghi seat_holds với thời hạn 3 phút
        const [holdInsert] = await connection.query(
            `INSERT INTO seat_holds (user_id, showtime_id, status, created_at, expires_at)
             VALUES (?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 3 MINUTE))`,
            [targetUserId, showtimeId]
        );
        const holdId = holdInsert.insertId;

        // Lấy chính xác thời điểm expires_at từ DB để khớp hoàn toàn với FK showtime_seats.held_until
        const [holdRecord] = await connection.query(
            `SELECT expires_at, TIMESTAMPDIFF(SECOND, NOW(), expires_at) AS remaining_seconds 
             FROM seat_holds WHERE id = ?`,
            [holdId]
        );
        const expiresAt = holdRecord[0].expires_at;
        const remainingSeconds = Math.max(0, Number(holdRecord[0].remaining_seconds || 180));

        // 6. Cập nhật showtime_seats thành 'held'
        await connection.query(
            `UPDATE showtime_seats
             SET state = 'held', hold_id = ?, held_until = ?
             WHERE showtime_id = ? AND seat_id IN (?)`,
            [holdId, expiresAt, showtimeId, seatIds]
        );

        await connection.commit();

        // Tính chi tiết số lượng và tổng tiền vé
        let standardCount = 0;
        let vipCount = 0;
        let totalPrice = 0;

        const heldSeatsInfo = lockedSeats.map(seat => {
            const price = Number(seat.price);
            totalPrice += price;
            if (seat.seat_type === 'vip') {
                vipCount++;
            } else {
                standardCount++;
            }
            return {
                seatId: seat.seat_id,
                label: `${seat.row_label}${seat.seat_number}`,
                seatType: seat.seat_type,
                price
            };
        });

        return {
            holdId,
            showtimeId,
            userId: targetUserId,
            expiresAt,
            remainingSeconds,
            heldSeats: heldSeatsInfo,
            pricingSummary: {
                standardCount,
                vipCount,
                totalSeats: heldSeatsInfo.length,
                totalPrice
            }
        };
    } catch (error) {
        if (connection) await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Hủy giữ ghế ngay lập tức khi khách hàng muốn bỏ chọn hoặc đổi suất.
 */
export async function releaseHold({ holdId, userId = null }) {
    if (!holdId) {
        const error = new Error('Thiếu holdId để giải phóng ghế.');
        error.statusCode = 400;
        throw error;
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Kiểm tra hold có tồn tại
        const [holds] = await connection.query(
            `SELECT id, showtime_id, user_id, status FROM seat_holds WHERE id = ? FOR UPDATE`,
            [holdId]
        );

        if (holds.length === 0) {
            const error = new Error('Không tìm thấy phiên giữ ghế này.');
            error.statusCode = 404;
            throw error;
        }

        const hold = holds[0];

        // 2. Cập nhật các ghế trong showtime_seats về available trước
        await connection.query(
            `UPDATE showtime_seats
             SET state = 'available', hold_id = NULL, held_until = NULL
             WHERE hold_id = ?`,
            [holdId]
        );

        // 3. Đánh dấu hold là 'cancelled'
        await connection.query(
            `UPDATE seat_holds
             SET status = 'cancelled'
             WHERE id = ?`,
            [holdId]
        );

        await connection.commit();
        return { success: true, message: 'Đã giải phóng các ghế được giữ thành công.' };
    } catch (error) {
        if (connection) await connection.rollback();
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Lấy thông tin chi tiết một phiên giữ ghế kèm thời gian còn lại.
 */
export async function getHoldDetails(holdId) {
    await cleanExpiredHolds();

    const [rows] = await pool.query(
        `SELECT 
            sh.id AS hold_id,
            sh.user_id,
            sh.showtime_id,
            sh.status,
            sh.created_at,
            sh.expires_at,
            GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), sh.expires_at)) AS remaining_seconds,
            s.starts_at,
            s.format,
            s.base_price,
            m.title AS movie_title,
            c.name AS cinema_name,
            r.name AS room_name
        FROM seat_holds sh
        JOIN showtimes s ON sh.showtime_id = s.id
        JOIN movies m ON s.movie_id = m.id
        JOIN rooms r ON s.room_id = r.id
        JOIN cinemas c ON r.cinema_id = c.id
        WHERE sh.id = ?`,
        [holdId]
    );

    if (rows.length === 0) {
        const error = new Error('Không tìm thấy phiên giữ ghế.');
        error.statusCode = 404;
        throw error;
    }

    const hold = rows[0];

    const [seats] = await pool.query(
        `SELECT 
            ss.seat_id,
            ss.price,
            s.row_label,
            s.seat_number,
            s.seat_type
        FROM showtime_seats ss
        JOIN seats s ON ss.seat_id = s.id
        WHERE ss.hold_id = ?`,
        [holdId]
    );

    const isExpired = hold.status === 'expired' || Number(hold.remaining_seconds) <= 0;

    return {
        holdId: hold.hold_id,
        userId: hold.user_id,
        showtimeId: hold.showtime_id,
        status: isExpired ? 'expired' : hold.status,
        expiresAt: hold.expires_at,
        remainingSeconds: isExpired ? 0 : Number(hold.remaining_seconds),
        isExpired,
        movieTitle: hold.movie_title,
        cinemaName: hold.cinema_name,
        roomName: hold.room_name,
        startsAt: hold.starts_at,
        format: hold.format,
        seats: seats.map(s => ({
            seatId: s.seat_id,
            label: `${s.row_label}${s.seat_number}`,
            seatType: s.seat_type,
            price: Number(s.price)
        }))
    };
}
