import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool, { testConnection } from './src/config/db.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Cấu hình CORS cho phép client gọi API
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

app.use(express.json());

// Helper chuẩn hóa dữ liệu phim trả về cho frontend
function mapMovie(row) {
    const releaseDateStr = row.release_date instanceof Date
        ? row.release_date.toISOString().slice(0, 10)
        : String(row.release_date || '').slice(0, 10);

    return {
        id: row.id,
        title: row.title,
        shortTitle: row.short_title,
        genre: row.genre,
        duration: row.duration_minutes,
        age: row.age_rating,
        rating: row.rating !== null ? Number(row.rating) : null,
        reviews: row.review_count,
        format: row.format_label,
        country: row.country,
        imax: Boolean(row.imax),
        image: row.poster_url,
        description: row.description,
        releaseDate: releaseDateStr,
        status: row.status,
        featuredOrder: row.featured_order,
        trailerUrl: row.trailer_url
    };
}

// 1. Kiểm tra trạng thái server & MySQL
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS ok');
        res.json({
            success: true,
            message: 'Server Nova Cinema và MySQL đang hoạt động tốt.',
            db: rows.length > 0
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi kết nối MySQL.',
            error: error.message
        });
    }
});

// 2. Trang chủ: Catalog gồm danh sách phim và danh sách rạp
app.get('/api/catalog', async (req, res) => {
    try {
        const [movies] = await pool.query(
            `SELECT * FROM movies WHERE is_visible = TRUE ORDER BY featured_order ASC, release_date DESC`
        );
        const [cinemas] = await pool.query(
            `SELECT id, name, address FROM cinemas WHERE is_active = TRUE ORDER BY id ASC`
        );

        res.json({
            success: true,
            data: {
                movies: movies.map(mapMovie),
                cinemas: cinemas.map(c => ({ id: c.id, name: c.name, address: c.address }))
            }
        });
    } catch (error) {
        console.error('Error fetching catalog:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi tải danh mục phim.', error: error.message });
    }
});

// 3. Danh sách phim (hỗ trợ tìm kiếm, lọc theo status, genre)
app.get('/api/movies', async (req, res) => {
    try {
        const { q, status, genre } = req.query;
        let query = `SELECT * FROM movies WHERE is_visible = TRUE`;
        const params = [];

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }
        if (genre) {
            query += ` AND genre LIKE ?`;
            params.push(`%${genre}%`);
        }
        if (q) {
            query += ` AND (title LIKE ? OR short_title LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }

        query += ` ORDER BY featured_order ASC, release_date DESC`;
        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows.map(mapMovie) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Chi tiết một phim
app.get('/api/movies/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM movies WHERE id = ?`, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phim.' });
        }
        res.json({ success: true, data: mapMovie(rows[0]) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Danh sách rạp
app.get('/api/cinemas', async (req, res) => {
    try {
        const [cinemas] = await pool.query(
            `SELECT id, name, address FROM cinemas WHERE is_active = TRUE ORDER BY id ASC`
        );
        res.json({ success: true, data: cinemas });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 6. Lấy lịch chiếu theo phim, rạp và ngày
app.get('/api/showtimes', async (req, res) => {
    try {
        const { movieId, cinemaId, date } = req.query;
        if (!movieId || !cinemaId || !date) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp movieId, cinemaId và date.' });
        }

        const query = `
            SELECT 
                s.id,
                s.movie_id,
                s.room_id,
                s.starts_at,
                s.ends_at,
                s.base_price,
                s.format,
                c.name AS cinema_name,
                r.name AS room_name
            FROM showtimes s
            JOIN rooms r ON s.room_id = r.id
            JOIN cinemas c ON r.cinema_id = c.id
            WHERE s.movie_id = ?
              AND c.id = ?
              AND DATE(s.starts_at) = ?
              AND s.status = 'scheduled'
              AND s.starts_at > NOW()
            ORDER BY s.starts_at ASC
        `;

        const [rows] = await pool.query(query, [movieId, cinemaId, date]);

        const data = rows.map(row => {
            const startsAt = new Date(row.starts_at);
            const hours = String(startsAt.getHours()).padStart(2, '0');
            const minutes = String(startsAt.getMinutes()).padStart(2, '0');

            return {
                id: row.id,
                movieId: row.movie_id,
                cinemaName: row.cinema_name,
                roomName: row.room_name,
                format: row.format,
                startsAt: row.starts_at,
                date: date,
                time: `${hours}:${minutes}`,
                price: Number(row.base_price)
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 7. Danh sách sản phẩm (bắp nước, combo)
app.get('/api/products', async (req, res) => {
    try {
        const { category } = req.query;
        let query = `SELECT * FROM products WHERE is_active = TRUE`;
        const params = [];

        if (category) {
            query += ` AND category = ?`;
            params.push(category);
        }

        query += ` ORDER BY id ASC`;
        const [rows] = await pool.query(query, params);
        res.json({
            success: true,
            data: rows.map(p => ({
                id: p.id,
                code: p.code,
                name: p.name,
                category: p.category,
                description: p.description,
                price: Number(p.price),
                image: p.image_url
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Khởi động server
app.listen(PORT, async () => {
    console.log(`🚀 Server Nova Cinema đang chạy tại http://localhost:${PORT}`);
    await testConnection();
});
