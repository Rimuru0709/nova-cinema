import 'dotenv/config';
import express from 'express';
import cors from 'cors';
<<<<<<< HEAD
=======
import pool, { testConnection } from './src/config/db.js';
import showtimeRoutes from './src/routes/showtimeRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import { cleanExpiredHolds, ensureDefaultUser } from './src/services/seatHoldService.js';
>>>>>>> bd0698c (Tính năng lịch chiếu và Chọn suất chiếu, chọn ghế)

const app = express();

const PORT = Number(process.env.PORT || 5000);

// Cho phép React gọi backend
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

// Đọc dữ liệu JSON từ frontend
app.use(express.json());

// Đường dẫn mặc định
app.get('/', (req, res) => {
    res.json({
        message: 'Chào mừng đến với API Nova Cinema.'
    });
});

<<<<<<< HEAD
// Kiểm tra server
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server Nova Cinema đang hoạt động.'
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
=======
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

// 6. Tuyến đường quản lý lịch chiếu & sơ đồ ghế (TV3)
app.use('/api/showtimes', showtimeRoutes);

// 7. Tuyến đường quản lý giữ ghế (TV3) & đơn đặt vé / thanh toán (TV4)
app.use('/api/bookings', bookingRoutes);

// 8. Danh sách sản phẩm (bắp nước, combo)
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
    await ensureDefaultUser();
    await cleanExpiredHolds();

    // Tự động giải phóng ghế hết hạn sau mỗi 10 giây
    setInterval(async () => {
        try {
            await cleanExpiredHolds();
        } catch (err) {
            console.error('Lỗi định kỳ dọn dẹp ghế hết hạn:', err);
        }
    }, 10000);
});
>>>>>>> bd0698c (Tính năng lịch chiếu và Chọn suất chiếu, chọn ghế)
