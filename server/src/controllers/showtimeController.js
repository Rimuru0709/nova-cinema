import pool from '../config/db.js';
import { getShowtimeSeats as fetchSeatsService, cleanExpiredHolds } from '../services/seatHoldService.js';

/**
 * Lấy danh sách lịch chiếu hỗ trợ lọc theo phim, rạp, ngày và giờ.
 */
export async function getShowtimes(req, res) {
    try {
        const { movieId, cinemaId, date, time } = req.query;
        await cleanExpiredHolds();

        let query = `
            SELECT 
                s.id,
                s.movie_id,
                s.room_id,
                s.starts_at,
                s.ends_at,
                s.base_price,
                s.format,
                s.status,
                m.title AS movie_title,
                m.duration_minutes,
                m.poster_url,
                m.age_rating,
                c.id AS cinema_id,
                c.name AS cinema_name,
                c.address AS cinema_address,
                r.name AS room_name,
                (SELECT COUNT(*) FROM showtime_seats ss WHERE ss.showtime_id = s.id AND ss.state = 'available') AS available_seats,
                (SELECT COUNT(*) FROM showtime_seats ss WHERE ss.showtime_id = s.id) AS total_seats
            FROM showtimes s
            JOIN movies m ON s.movie_id = m.id
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas c ON r.cinema_id = c.id
            WHERE s.status = 'scheduled'
              AND s.starts_at > NOW()
        `;

        const params = [];

        if (movieId) {
            query += ` AND s.movie_id = ?`;
            params.push(movieId);
        }

        if (cinemaId) {
            query += ` AND c.id = ?`;
            params.push(cinemaId);
        }

        if (date) {
            query += ` AND DATE(s.starts_at) = ?`;
            params.push(date);
        }

        // Lọc theo khung giờ hoặc giờ bắt đầu
        if (time) {
            if (time === 'morning') {
                // Sáng: trước 12:00
                query += ` AND HOUR(s.starts_at) < 12`;
            } else if (time === 'afternoon') {
                // Chiều: 12:00 đến 17:59
                query += ` AND HOUR(s.starts_at) >= 12 AND HOUR(s.starts_at) < 18`;
            } else if (time === 'evening') {
                // Tối: 18:00 trở đi
                query += ` AND HOUR(s.starts_at) >= 18`;
            } else if (/^\d{1,2}:\d{2}$/.test(time)) {
                // Khớp chính xác giờ:phút
                query += ` AND DATE_FORMAT(s.starts_at, '%H:%i') = ?`;
                params.push(time);
            }
        }

        query += ` ORDER BY s.starts_at ASC`;

        const [rows] = await pool.query(query, params);

        const data = rows.map(row => {
            const startsAt = new Date(row.starts_at);
            const hours = String(startsAt.getHours()).padStart(2, '0');
            const minutes = String(startsAt.getMinutes()).padStart(2, '0');
            const dateStr = new Date(startsAt.getTime() + 7 * 3600000).toISOString().slice(0, 10);

            return {
                id: row.id,
                movieId: row.movie_id,
                movieTitle: row.movie_title,
                moviePoster: row.poster_url,
                duration: row.duration_minutes,
                ageRating: row.age_rating,
                cinemaId: row.cinema_id,
                cinemaName: row.cinema_name,
                cinemaAddress: row.cinema_address,
                roomId: row.room_id,
                roomName: row.room_name,
                format: row.format,
                startsAt: row.starts_at,
                endsAt: row.ends_at,
                date: dateStr,
                time: `${hours}:${minutes}`,
                price: Number(row.base_price),
                availableSeats: Number(row.available_seats || 0),
                totalSeats: Number(row.total_seats || 0)
            };
        });

        res.json({ success: true, count: data.length, data });
    } catch (error) {
        console.error('Lỗi khi lấy lịch chiếu:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy lịch chiếu.', error: error.message });
    }
}

/**
 * Kiểm tra tính hợp lệ và lấy thông tin chi tiết một suất chiếu.
 */
export async function getShowtimeById(req, res) {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
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
                m.poster_url,
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
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy suất chiếu.' });
        }

        const row = rows[0];
        const isStarted = new Date(row.starts_at) <= new Date();
        const isCancelled = row.status === 'cancelled';
        const isValid = !isStarted && !isCancelled;

        let validityMessage = 'Suất chiếu hợp lệ và còn mở đặt vé.';
        if (isStarted) {
            validityMessage = 'Suất chiếu đã bắt đầu, không thể đặt vé.';
        } else if (isCancelled) {
            validityMessage = 'Suất chiếu đã bị hủy.';
        }

        const startsAt = new Date(row.starts_at);
        const hours = String(startsAt.getHours()).padStart(2, '0');
        const minutes = String(startsAt.getMinutes()).padStart(2, '0');

        res.json({
            success: true,
            data: {
                id: row.id,
                movieId: row.movie_id,
                movieTitle: row.movie_title,
                moviePoster: row.poster_url,
                duration: row.duration_minutes,
                ageRating: row.age_rating,
                cinemaId: row.cinema_id,
                cinemaName: row.cinema_name,
                cinemaAddress: row.cinema_address,
                roomId: row.room_id,
                roomName: row.room_name,
                roomCapacity: row.room_capacity,
                format: row.format,
                startsAt: row.starts_at,
                endsAt: row.ends_at,
                time: `${hours}:${minutes}`,
                price: Number(row.base_price),
                status: row.status,
                isValid,
                validityMessage
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin suất chiếu:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

/**
 * Lấy sơ đồ ghế và trạng thái chi tiết theo phòng chiếu của suất chiếu.
 */
export async function getShowtimeSeats(req, res) {
    try {
        const { id } = req.params;
        const userId = null;
        const result = await fetchSeatsService(id, userId);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Lỗi khi tải sơ đồ ghế:', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}
