import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool, { testConnection } from './src/config/db.js';
import authRoutes from "./src/routes/auth.js";
import showtimeRoutes from "./src/routes/showtimeRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import { cleanExpiredHolds } from "./src/services/seatHoldService.js";


const app = express();
const PORT = Number(process.env.PORT || 5000);

// Cấu hình CORS cho phép client gọi API
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

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

// Expired holds are also cleaned before every seat/checkout request.
let expiryRunning = false;
setInterval(async () => {
    if (expiryRunning) return;
    expiryRunning = true;
    try { await cleanExpiredHolds(); }
    catch (error) { console.error('Không thể dọn phiên giữ ghế:', error.message); }
    finally { expiryRunning = false; }
}, 10000).unref();

// Khởi động server
app.listen(PORT, async () => {
    console.log(`🚀 Server Nova Cinema đang chạy tại http://localhost:${PORT}`);
    await testConnection();
});
